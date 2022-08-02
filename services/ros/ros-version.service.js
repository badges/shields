import gql from 'graphql-tag'
import Joi from 'joi'
import yaml from 'js-yaml'
import { renderVersionBadge } from '../version.js'
import { GithubAuthV4Service } from '../github/github-auth-service.js'
import { NotFound, InvalidResponse } from '../index.js'

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
    version: Joi.string().optional(),
    packages: Joi.array().items(Joi.string()).optional(),
  }).optional(),
})

export default class RosVersion extends GithubAuthV4Service {
  static category = 'version'

  static route = { base: 'ros/v', pattern: ':distro/:packageName' }

  static examples = [
    {
      title: 'ROS Package Index',
      namedParams: { distro: 'humble', packageName: 'vision_msgs' },
      staticPreview: {
        ...renderVersionBadge({ version: '4.0.0' }),
        label: 'ros | humble',
      },
    },
  ]

  static defaultBadgeData = { label: 'ros' }

  async handle({ distro, packageName }) {
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
      packageName
    )

    return { ...renderVersionBadge({ version }), label: `ros | ${distro}` }
  }

  static _parseReleaseVersionFromDistro(distroYaml, packageName) {
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

    for (const [repoName, repo] of Object.entries(
      validatedDistro.repositories
    )) {
      const validatedRepo = this._validate(repo, repoSchema, {
        prettyErrorMessage: `invalid section for ${repoName} in distribution.yml`,
      })
      if (!validatedRepo?.release) {
        continue
      }
      // "If no package is specified, one package with the name of the repository is assumed."
      // https://www.ros.org/reps/rep-0141.html
      for (const pkg of validatedRepo.release.packages ?? [repoName]) {
        if (pkg !== packageName) {
          continue
        }
        if (!validatedRepo.release.version) {
          throw new NotFound({
            prettyMessage: `unknown release version for: ${packageName}`,
          })
        }
        // Strip off "release inc" suffix
        return repo.release.version.replace(/-\d+$/, '')
      }
    }

    throw new NotFound({ prettyMessage: `package not found: ${packageName}` })
  }
}
