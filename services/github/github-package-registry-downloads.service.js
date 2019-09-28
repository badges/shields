'use strict'

const gql = require('graphql-tag')
const Joi = require('@hapi/joi')
const { downloadCount } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV4Service } = require('./github-auth-service')
const { documentation, transformErrors } = require('./github-helpers')
const { NotFound } = require('..')

// https://developer.github.com/v4/object/registrypackagestatistics/
// https://developer.github.com/v4/object/registrypackageversionstatistics/
const packageStatistics = Joi.object({
  statistics: Joi.object({
    downloadsToday: nonNegativeInteger,
    downloadsThisWeek: nonNegativeInteger,
    downloadsThisMonth: nonNegativeInteger,
    downloadsThisYear: nonNegativeInteger,
    downloadsTotalCount: nonNegativeInteger,
  }).required(),
})

const totalDownloadsSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      registryPackages: Joi.object({
        nodes: Joi.array()
          .items(packageStatistics)
          .min(0)
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

const versionDownloadsSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      registryPackages: Joi.object({
        nodes: Joi.array()
          .items(
            Joi.object({
              version: packageStatistics.allow(null),
            })
          )
          .min(0)
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

const latestVersionDownloadsSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      registryPackages: Joi.object({
        nodes: Joi.array()
          .items(
            Joi.object({
              latestVersion: packageStatistics,
            })
          )
          .min(0)
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

const intervalMap = {
  today: {
    transform: statistics => statistics.downloadsToday,
    messageSuffix: '/today',
  },
  week: {
    transform: statistics => statistics.downloadsThisWeek,
    messageSuffix: '/week',
  },
  month: {
    transform: statistics => statistics.downloadsThisMonth,
    messageSuffix: '/month',
  },
  year: {
    transform: statistics => statistics.downloadsThisYear,
    messageSuffix: '/year',
  },
  total: {
    transform: statistics => statistics.downloadsTotalCount,
    messageSuffix: '',
  },
}

module.exports = class GithubPackageRegistryDownloads extends GithubAuthV4Service {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'github/packages/downloads',
      pattern:
        ':user/:repo/:interval(today|week|month|year|total)/:packageName/:version?',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub Package Registry Downloads',
        pattern:
          ':user/:repo/:interval(today|week|month|year|total)/:packageName',
        namedParams: {
          user: 'github',
          repo: 'auto-complete-element',
          interval: 'total',
          packageName: 'auto-complete-element',
        },
        staticPreview: this.render({
          interval: 'total',
          count: 50,
        }),
        documentation,
      },
      {
        title: 'GitHub Package Registry Downloads (Version)',
        pattern:
          ':user/:repo/:interval(today|week|month|year|total)/:packageName/:version',
        namedParams: {
          user: 'github',
          repo: 'auto-complete-element',
          interval: 'total',
          packageName: 'auto-complete-element',
          version: '1.0.6',
        },
        staticPreview: this.render({
          interval: 'total',
          count: 5,
          version: '1.0.6',
        }),
        documentation,
      },
      {
        title: 'GitHub Package Registry Downloads (Latest Version)',
        pattern:
          ':user/:repo/:interval(today|week|month|year|total)/:packageName/:version',
        namedParams: {
          user: 'github',
          repo: 'auto-complete-element',
          interval: 'total',
          packageName: 'auto-complete-element',
          version: 'latest',
        },
        staticPreview: this.render({
          interval: 'total',
          count: 9,
          version: 'latest',
        }),
        documentation,
      },
    ]
  }

  static _getLabel(version) {
    if (version) {
      return `downloads@${version}`
    } else {
      return 'downloads'
    }
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static render({ interval, count, version }) {
    const { messageSuffix } = intervalMap[interval]
    return {
      label: this._getLabel(version),
      message: `${metric(count)}${messageSuffix}`,
      color: downloadCount(count),
    }
  }

  async fetch({ user, repo, packageName, version }) {
    if (version) {
      if (version === 'latest') {
        return await this._requestGraphql({
          query: gql`
            query($user: String!, $repo: String!, $packageName: String!) {
              repository(owner: $user, name: $repo) {
                registryPackages(name: $packageName, first: 1) {
                  nodes {
                    latestVersion {
                      statistics {
                        downloadsThisMonth
                        downloadsThisWeek
                        downloadsThisYear
                        downloadsToday
                        downloadsTotalCount
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { user, repo, packageName },
          schema: latestVersionDownloadsSchema,
          transformErrors,
        })
      } else {
        return await this._requestGraphql({
          query: gql`
            query(
              $user: String!
              $repo: String!
              $packageName: String!
              $version: String!
            ) {
              repository(owner: $user, name: $repo) {
                registryPackages(name: $packageName, first: 1) {
                  nodes {
                    version(version: $version) {
                      statistics {
                        downloadsThisMonth
                        downloadsThisWeek
                        downloadsThisYear
                        downloadsToday
                        downloadsTotalCount
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { user, repo, packageName, version },
          schema: versionDownloadsSchema,
          transformErrors,
        })
      }
    } else {
      return await this._requestGraphql({
        query: gql`
          query($user: String!, $repo: String!, $packageName: String!) {
            repository(owner: $user, name: $repo) {
              registryPackages(name: $packageName, first: 1) {
                nodes {
                  statistics {
                    downloadsThisMonth
                    downloadsThisWeek
                    downloadsThisYear
                    downloadsToday
                    downloadsTotalCount
                  }
                }
              }
            }
          }
        `,
        variables: { user, repo, packageName },
        schema: totalDownloadsSchema,
        transformErrors,
      })
    }
  }

  transform({ json, interval, version }) {
    const ghPackage = json.data.repository.registryPackages.nodes[0]
    if (!ghPackage) {
      throw new NotFound({ prettyMessage: 'package not found' })
    }

    let statistics
    if (version === 'latest') {
      statistics = ghPackage.latestVersion.statistics
    } else if (version) {
      if (!ghPackage.version) {
        throw new NotFound({ prettyMessage: 'version not found' })
      }
      statistics = ghPackage.version.statistics
    } else {
      statistics = ghPackage.statistics
    }
    const { transform } = intervalMap[interval]
    return { count: transform(statistics) }
  }

  async handle({ user, repo, interval, packageName, version }) {
    const json = await this.fetch({ user, repo, packageName, version })
    const { count } = this.transform({ json, interval, version })
    return this.constructor.render({ count, interval, version })
  }
}
