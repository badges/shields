'use strict'

const Joi = require('@hapi/joi')
const { addv } = require('../text-formatters')
const { version: versionColor } = require('../color-formatters')
const { latest } = require('../version')
const { GithubAuthV3Service } = require('./github-auth-service')
const {
  fetchLatestRelease,
  releaseInfoSchema,
} = require('./github-common-fetch')
const { documentation, errorMessagesFor } = require('./github-helpers')
const { NotFound, redirector } = require('..')

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
  sort: Joi.string()
    .valid('date', 'semver')
    .default('date'),
}).required()

const releaseInfoArraySchema = Joi.alternatives().try(
  Joi.array().items(releaseInfoSchema),
  Joi.array().length(0)
)

class GithubRelease extends GithubAuthV3Service {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github/v/release',
      pattern: ':user/:repo',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub release (latest by date)',
        namedParams: { user: 'expressjs', repo: 'express' },
        queryParams: {},
        staticPreview: this.render({
          version: 'v4.16.4',
          sort: 'date',
          isPrerelease: false,
        }),
        documentation,
      },
      {
        title: 'GitHub release (latest by date including pre-releases)',
        namedParams: { user: 'expressjs', repo: 'express' },
        queryParams: { include_prereleases: null },
        staticPreview: this.render({
          version: 'v5.0.0-alpha.7',
          sort: 'date',
          isPrerelease: true,
        }),
        documentation,
      },
      {
        title: 'GitHub release (latest SemVer)',
        namedParams: { user: 'expressjs', repo: 'express' },
        queryParams: { sort: 'semver' },
        staticPreview: this.render({
          version: 'v4.16.4',
          sort: 'semver',
          isPrerelease: false,
        }),
        documentation,
      },
      {
        title: 'GitHub release (latest SemVer including pre-releases)',
        namedParams: { user: 'expressjs', repo: 'express' },
        queryParams: { sort: 'semver', include_prereleases: null },
        staticPreview: this.render({
          version: 'v5.0.0-alpha.7',
          sort: 'semver',
          isPrerelease: true,
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'release',
      namedLogo: 'github',
    }
  }

  static render({ version, sort, isPrerelease }) {
    let color = 'blue'
    color = sort === 'semver' ? versionColor(version) : color
    color = isPrerelease ? 'orange' : color
    return { message: addv(version), color }
  }

  async fetchReleases({ user, repo }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/releases`,
      schema: releaseInfoArraySchema,
      errorMessages: errorMessagesFor('repo not found'),
    })
  }

  static getLatestRelease({ releases, sort, includePrereleases }) {
    if (sort === 'semver') {
      const latestRelease = latest(
        releases.map(release => release.tag_name),
        {
          pre: includePrereleases,
        }
      )
      const kvpairs = Object.assign(
        ...releases.map(release => ({ [release.tag_name]: release.prerelease }))
      )
      return { tag_name: latestRelease, prerelease: kvpairs[latestRelease] }
    }

    if (!includePrereleases) {
      const stableReleases = releases.filter(release => !release.prerelease)
      if (stableReleases.length > 0) {
        return stableReleases[0]
      }
    }

    return releases[0]
  }

  async handle({ user, repo }, queryParams) {
    const sort = queryParams.sort
    const includePrereleases = queryParams.include_prereleases !== undefined

    if (!includePrereleases && sort === 'date') {
      const latestRelease = await fetchLatestRelease(this, { user, repo })
      return this.constructor.render({
        version: latestRelease.tag_name,
        sort,
        isPrerelease: latestRelease.prerelease,
      })
    }

    const releases = await this.fetchReleases({ user, repo })
    if (releases.length === 0) {
      throw new NotFound({ prettyMessage: 'no releases' })
    }
    const latestRelease = this.constructor.getLatestRelease({
      releases,
      sort,
      includePrereleases,
    })

    return this.constructor.render({
      version: latestRelease.tag_name,
      sort,
      isPrerelease: latestRelease.prerelease,
    })
  }
}

const redirects = {
  GithubReleaseRedirect: redirector({
    name: 'GithubReleaseRedirect',
    category: 'version',
    route: {
      base: 'github/release',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/github/v/release/${user}/${repo}`,
    dateAdded: new Date('2019-08-17'),
  }),
  GithubReleasePreRedirect: redirector({
    category: 'version',
    route: {
      base: 'github/release-pre',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/github/v/release/${user}/${repo}`,
    transformQueryParams: params => ({ include_prereleases: null }),
    dateAdded: new Date('2019-08-17'),
  }),
  GithubReleaseRedirectAll: redirector({
    name: 'GithubReleaseRedirectAll',
    category: 'version',
    route: {
      base: 'github/release',
      pattern: ':user/:repo/all',
    },
    transformPath: ({ user, repo }) => `/github/v/release/${user}/${repo}`,
    transformQueryParams: params => ({ include_prereleases: null }),
    dateAdded: new Date('2019-08-17'),
  }),
}

module.exports = {
  GithubRelease,
  ...redirects,
}
