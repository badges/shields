import gql from 'graphql-tag'
import Joi from 'joi'
import yaml from 'js-yaml'
import { renderVersionBadge } from '../version.js'
import { GithubAuthV4Service } from '../github/github-auth-service.js'
import { NotFound, InvalidResponse, pathParams } from '../index.js'

const tagsSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      refs: Joi.object({
        edges: Joi.array()
          .items({
            node: Joi.object({
              name: Joi.string().required(),
            }).required(),
          })
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

const contentSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      object: Joi.object({
        text: Joi.string().required(),
      }).allow(null),
    }).required(),
  }).required(),
}).required()

const distroSchema = Joi.object({
  repositories: Joi.object().required(),
})
const repoSchema = Joi.object({
  release: Joi.object({
    version: Joi.string().required(),
  }).required(),
})

const description = `
To use this badge, specify the ROS <a href="http://docs.ros.org">distribution</a>
(e.g. <code>noetic</code> or <code>humble</code>) and the package repository name
(in the case of single-package repos, this may be the same as the package name).
This badge determines which versions are part of an official ROS distribution by
fetching from the <a href="https://github.com/ros/rosdistro">rosdistro</a> YAML files,
at the tag corresponding to the latest release.
`

export default class RosVersion extends GithubAuthV4Service {
  static category = 'version'

  static route = { base: 'ros/v', pattern: ':distro/:repoName' }

  static openApi = {
    '/ros/v/{distro}/{repoName}': {
      get: {
        summary: 'ROS Package Index',
        description,
        parameters: pathParams(
          {
            name: 'distro',
            example: 'humble',
          },
          {
            name: 'repoName',
            example: 'vision_msgs',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'ros' }

  async handle({ distro, repoName }) {
    const tagsJson = await this._requestGraphql({
      query: gql`
        query ($refPrefix: String!) {
          repository(owner: "ros", name: "rosdistro") {
            refs(
              refPrefix: $refPrefix
              first: 30
              orderBy: { field: TAG_COMMIT_DATE, direction: DESC }
            ) {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      `,
      variables: { refPrefix: `refs/tags/${distro}/` },
      schema: tagsSchema,
    })

    // Filter for tags that look like dates: humble/2022-06-10
    const tags = tagsJson.data.repository.refs.edges
      .map(edge => edge.node.name)
      .filter(tag => /^\d+-\d+-\d+$/.test(tag))
      .sort()
      .reverse()

    const ref = tags[0] ? `refs/tags/${distro}/${tags[0]}` : 'refs/heads/master'
    const prettyRef = tags[0] ? `${distro}/${tags[0]}` : 'master'

    const contentJson = await this._requestGraphql({
      query: gql`
        query ($expression: String!) {
          repository(owner: "ros", name: "rosdistro") {
            object(expression: $expression) {
              ... on Blob {
                text
              }
            }
          }
        }
      `,
      variables: {
        expression: `${ref}:${distro}/distribution.yaml`,
      },
      schema: contentSchema,
    })

    if (!contentJson.data.repository.object) {
      throw new NotFound({
        prettyMessage: `distribution.yaml not found: ${distro}@${prettyRef}`,
      })
    }
    const version = this.constructor._parseReleaseVersionFromDistro(
      contentJson.data.repository.object.text,
      repoName,
    )

    return { ...renderVersionBadge({ version }), label: `ros | ${distro}` }
  }

  static _parseReleaseVersionFromDistro(distroYaml, repoName) {
    let distro
    try {
      distro = yaml.load(distroYaml)
    } catch (err) {
      throw new InvalidResponse({
        prettyMessage: 'unparseable distribution.yml',
        underlyingError: err,
      })
    }

    const validatedDistro = this._validate(distro, distroSchema, {
      prettyErrorMessage: 'invalid distribution.yml',
    })
    if (!validatedDistro.repositories[repoName]) {
      throw new NotFound({ prettyMessage: `repo not found: ${repoName}` })
    }

    const repoInfo = this._validate(
      validatedDistro.repositories[repoName],
      repoSchema,
      {
        prettyErrorMessage: `invalid section for ${repoName} in distribution.yml`,
      },
    )

    // Strip off "release inc" suffix
    return repoInfo.release.version.replace(/-\d+$/, '')
  }
}
