'use strict'

const gql = require('graphql-tag')
const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { GithubAuthV4Service } = require('./github-auth-service')
const { documentation, transformErrors } = require('./github-helpers')
const { NotFound } = require('..')

// https://developer.github.com/v4/object/registrypackageversion/
const packageVersion = Joi.object({
  preRelease: Joi.bool().required(),
  version: Joi.string().required(),
})

const latestVersionSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      registryPackages: Joi.object({
        nodes: Joi.array()
          .items(
            Joi.object({
              latestVersion: packageVersion,
            })
          )
          .min(0)
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

const versionSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      registryPackages: Joi.object({
        nodes: Joi.array()
          .items(
            Joi.object({
              versions: Joi.object({
                nodes: Joi.array()
                  .items(packageVersion)
                  .min(0)
                  .required(),
              }),
            })
          )
          .min(0)
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

module.exports = class GithubPackageRegistryVersion extends GithubAuthV4Service {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github/packages',
      pattern: ':type(v|vpre)/:user/:repo/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub Package Registry Version (with prereleases)',
        pattern: 'vpre/:user/:repo/:packageName',
        namedParams: {
          user: 'github',
          repo: 'semantic',
          packageName: 'semantic',
        },
        staticPreview: renderVersionBadge({ version: '0.8.0.0' }),
        documentation,
      },
      {
        title: 'GitHub Package Registry Version',
        pattern: 'v/:user/:repo/:packageName',
        namedParams: {
          user: 'github',
          repo: 'auto-complete-element',
          packageName: 'auto-complete-element',
        },
        staticPreview: renderVersionBadge({ version: '0.8.0.0' }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'version' }
  }

  async fetch({ user, repo, packageName, includePrereleases }) {
    if (includePrereleases) {
      return await this._requestGraphql({
        query: gql`
          query($user: String!, $repo: String!, $packageName: String!) {
            repository(owner: $user, name: $repo) {
              registryPackages(name: $packageName, first: 1) {
                nodes {
                  latestVersion {
                    preRelease
                    version
                  }
                }
              }
            }
          }
        `,
        variables: { user, repo, packageName },
        schema: latestVersionSchema,
        transformErrors,
      })
    } else {
      return await this._requestGraphql({
        query: gql`
          query($user: String!, $repo: String!, $packageName: String!) {
            repository(owner: $user, name: $repo) {
              registryPackages(name: $packageName, first: 1) {
                nodes {
                  versions(first: 1) {
                    nodes {
                      preRelease
                      version
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { user, repo, packageName },
        schema: versionSchema,
        transformErrors,
      })
    }
  }

  transform({ json, includePrereleases }) {
    const {
      data: {
        repository: {
          registryPackages: {
            nodes: [ghPackage],
          },
        },
      },
    } = json

    if (!ghPackage) {
      throw new NotFound({ prettyMessage: 'package not found' })
    }

    if (includePrereleases) {
      const {
        latestVersion: { version },
      } = ghPackage
      return { version }
    } else {
      const {
        versions: {
          nodes: [{ version }],
        },
      } = ghPackage
      return { version }
    }
  }

  async handle({ type, user, repo, packageName }) {
    const includePrereleases = type === 'vpre'
    const json = await this.fetch({
      user,
      repo,
      packageName,
      includePrereleases,
    })
    const { version } = this.transform({ json, includePrereleases })
    return renderVersionBadge({ version })
  }
}
