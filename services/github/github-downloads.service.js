'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { downloadCount: downloadCountColor } = require('../color-formatters')
const { GithubAuthService } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const releaseSchema = Joi.object({
  assets: Joi.array()
    .items({
      name: Joi.string().required(),
      download_count: nonNegativeInteger,
    })
    .required(),
}).required()

const releaseArraySchema = Joi.array()
  .items(releaseSchema)
  .required()

module.exports = class GithubDownloads extends GithubAuthService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'github',
      pattern: ':kind(downloads|downloads-pre)/:user/:repo/:tag*/:assetName',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub All Releases',
        pattern: 'downloads/:user/:repo/total',
        namedParams: {
          user: 'atom',
          repo: 'atom',
        },
        staticPreview: this.render({
          assetName: 'total',
          downloadCount: 857000,
        }),
        documentation,
      },
      {
        title: 'GitHub Releases',
        pattern: 'downloads/:user/:repo/:tag/total',
        namedParams: {
          user: 'atom',
          repo: 'atom',
          tag: 'latest',
        },
        staticPreview: this.render({
          tag: 'latest',
          assetName: 'total',
          downloadCount: 27000,
        }),
        documentation,
      },
      {
        title: 'GitHub Pre-Releases',
        pattern: 'downloads-pre/:user/:repo/:tag/total',
        namedParams: {
          user: 'atom',
          repo: 'atom',
          tag: 'latest',
        },
        staticPreview: this.render({
          tag: 'latest',
          assetName: 'total',
          downloadCount: 2000,
        }),
        documentation,
      },
      {
        title: 'GitHub Releases (by Release)',
        pattern: 'downloads/:user/:repo/:tag/total',
        namedParams: {
          user: 'atom',
          repo: 'atom',
          tag: 'v0.190.0',
        },
        staticPreview: this.render({
          tag: 'v0.190.0',
          assetName: 'total',
          downloadCount: 490000,
        }),
        documentation,
      },
      {
        title: 'GitHub Releases (by Asset)',
        pattern: 'downloads/:user/:repo/:tag/:path',
        namedParams: {
          user: 'atom',
          repo: 'atom',
          tag: 'latest',
          path: 'atom-amd64.deb',
        },
        staticPreview: this.render({
          tag: 'latest',
          assetName: 'atom-amd64.deb',
          downloadCount: 3000,
        }),
        documentation,
      },
      {
        title: 'GitHub Pre-Releases (by Asset)',
        pattern: 'downloads-pre/:user/:repo/:tag/:path',
        namedParams: {
          user: 'atom',
          repo: 'atom',
          tag: 'latest',
          path: 'atom-amd64.deb',
        },
        staticPreview: this.render({
          tag: 'latest',
          assetName: 'atom-amd64.deb',
          downloadCount: 237,
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'downloads',
      namedLogo: 'github',
    }
  }

  static render({ tag, assetName, downloadCount }) {
    return {
      label: tag ? `downloads@${tag}` : 'downloads',
      message:
        assetName === 'total'
          ? metric(downloadCount)
          : `${metric(downloadCount)} [${assetName}]`,
      color: downloadCountColor(downloadCount),
    }
  }

  static transform({ releases, assetName }) {
    const downloadCount = releases.reduce((accum1, { assets }) => {
      const filteredAssets =
        assetName === 'total'
          ? assets
          : assets.filter(({ name }) => name.toLowerCase() === assetName)
      return (
        accum1 +
        filteredAssets.reduce(
          (accum2, { download_count: downloadCount }) => accum2 + downloadCount,
          0
        )
      )
    }, 0)
    return { downloadCount }
  }

  async handle({ kind, user, repo, tag, assetName }) {
    const commonAttrs = {
      errorMessages: errorMessagesFor('repo or release not found'),
    }

    let releases
    if (tag === 'latest' && kind === 'downloads') {
      const latestRelease = await this._requestJson({
        schema: releaseSchema,
        url: `/repos/${user}/${repo}/releases/latest`,
        ...commonAttrs,
      })
      releases = [latestRelease]
    } else if (tag === 'latest') {
      // Keep only the latest release.
      const [latestReleaseIncludingPrereleases] = await this._requestJson({
        schema: releaseArraySchema,
        url: `/repos/${user}/${repo}/releases`,
        options: { qs: { per_page: 1 } },
        ...commonAttrs,
      })
      releases = [latestReleaseIncludingPrereleases]
    } else if (tag === undefined) {
      const allReleases = await this._requestJson({
        schema: releaseArraySchema,
        url: `/repos/${user}/${repo}/releases`,
        options: { qs: { per_page: 500 } },
        ...commonAttrs,
      })
      releases = allReleases
    } else {
      const wantedRelease = await this._requestJson({
        schema: releaseSchema,
        url: `/repos/${user}/${repo}/releases/tags/${tag}`,
        ...commonAttrs,
      })
      releases = [wantedRelease]
    }

    const { downloadCount } = this.constructor.transform({
      releases,
      assetName,
    })

    return this.constructor.render({ tag, assetName, downloadCount })
  }
}
