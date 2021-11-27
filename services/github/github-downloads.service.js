import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { renderDownloadsBadge } from '../downloads.js'
import { NotFound } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { fetchLatestRelease } from './github-common-release.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

const queryParamSchema = Joi.object({
  sort: Joi.string().valid('date', 'semver').default('date'),
}).required()

const releaseSchema = Joi.object({
  assets: Joi.array()
    .items({
      name: Joi.string().required(),
      download_count: nonNegativeInteger,
    })
    .required(),
}).required()

const releaseArraySchema = Joi.alternatives().try(
  Joi.array().items(releaseSchema),
  Joi.array().length(0)
)

export default class GithubDownloads extends GithubAuthV3Service {
  static category = 'downloads'
  static route = {
    base: 'github',
    pattern: ':kind(downloads|downloads-pre)/:user/:repo/:tag*/:assetName',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub all releases',
      pattern: 'downloads/:user/:repo/total',
      namedParams: {
        user: 'atom',
        repo: 'atom',
      },
      staticPreview: this.render({
        assetName: 'total',
        downloads: 857000,
      }),
      documentation,
    },
    {
      title: 'GitHub release (latest by date)',
      pattern: 'downloads/:user/:repo/:tag/total',
      namedParams: {
        user: 'atom',
        repo: 'atom',
        tag: 'latest',
      },
      staticPreview: this.render({
        tag: 'latest',
        assetName: 'total',
        downloads: 27000,
      }),
      documentation,
    },
    {
      title: 'GitHub release (latest by SemVer)',
      pattern: 'downloads/:user/:repo/:tag/total',
      namedParams: {
        user: 'atom',
        repo: 'atom',
        tag: 'latest',
      },
      queryParams: { sort: 'semver' },
      staticPreview: this.render({
        tag: 'latest',
        assetName: 'total',
        downloads: 27000,
      }),
      documentation,
    },
    {
      title: 'GitHub release (latest by date including pre-releases)',
      pattern: 'downloads-pre/:user/:repo/:tag/total',
      namedParams: {
        user: 'atom',
        repo: 'atom',
        tag: 'latest',
      },
      staticPreview: this.render({
        tag: 'latest',
        assetName: 'total',
        downloads: 2000,
      }),
      documentation,
    },
    {
      title: 'GitHub release (latest by SemVer including pre-releases)',
      pattern: 'downloads-pre/:user/:repo/:tag/total',
      namedParams: {
        user: 'atom',
        repo: 'atom',
        tag: 'latest',
      },
      queryParams: { sort: 'semver' },
      staticPreview: this.render({
        tag: 'latest',
        assetName: 'total',
        downloads: 2000,
      }),
      documentation,
    },
    {
      title: 'GitHub release (by tag)',
      pattern: 'downloads/:user/:repo/:tag/total',
      namedParams: {
        user: 'atom',
        repo: 'atom',
        tag: 'v0.190.0',
      },
      staticPreview: this.render({
        tag: 'v0.190.0',
        assetName: 'total',
        downloads: 490000,
      }),
      documentation,
    },
    {
      title: 'GitHub release (latest by date and asset)',
      pattern: 'downloads/:user/:repo/:tag/:assetName',
      namedParams: {
        user: 'atom',
        repo: 'atom',
        tag: 'latest',
        assetName: 'atom-amd64.deb',
      },
      staticPreview: this.render({
        tag: 'latest',
        assetName: 'atom-amd64.deb',
        downloads: 3000,
      }),
      documentation,
    },
    {
      title: 'GitHub release (latest by SemVer and asset)',
      pattern: 'downloads/:user/:repo/:tag/:assetName',
      namedParams: {
        user: 'atom',
        repo: 'atom',
        tag: 'latest',
        assetName: 'atom-amd64.deb',
      },
      queryParams: { sort: 'semver' },
      staticPreview: this.render({
        tag: 'latest',
        assetName: 'atom-amd64.deb',
        downloads: 3000,
      }),
      documentation,
    },
    {
      title: 'GitHub release (latest by date and asset including pre-releases)',
      pattern: 'downloads-pre/:user/:repo/:tag/:assetName',
      namedParams: {
        user: 'atom',
        repo: 'atom',
        tag: 'latest',
        assetName: 'atom-amd64.deb',
      },
      staticPreview: this.render({
        tag: 'latest',
        assetName: 'atom-amd64.deb',
        downloads: 237,
      }),
      documentation,
    },
    {
      title:
        'GitHub release (latest by SemVer and asset including pre-releases)',
      pattern: 'downloads-pre/:user/:repo/:tag/:assetName',
      namedParams: {
        user: 'atom',
        repo: 'atom',
        tag: 'latest',
        assetName: 'atom-amd64.deb',
      },
      queryParams: { sort: 'semver' },
      staticPreview: this.render({
        tag: 'latest',
        assetName: 'atom-amd64.deb',
        downloads: 237,
      }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'downloads', namedLogo: 'github' }

  static render({ tag: version, assetName, downloads }) {
    const messageSuffixOverride =
      assetName !== 'total' ? `[${assetName}]` : undefined
    return renderDownloadsBadge({ downloads, messageSuffixOverride, version })
  }

  static transform({ releases, assetName }) {
    const downloads = releases.reduce((accum1, { assets }) => {
      const filteredAssets =
        assetName === 'total'
          ? assets
          : assets.filter(
              ({ name }) => name.toLowerCase() === assetName.toLowerCase()
            )
      return (
        accum1 +
        filteredAssets.reduce(
          (accum2, { download_count: downloads }) => accum2 + downloads,
          0
        )
      )
    }, 0)
    return { downloads }
  }

  async handle({ kind, user, repo, tag, assetName }, { sort }) {
    let releases
    if (tag === 'latest') {
      const includePre = kind === 'downloads-pre' || undefined
      const latestRelease = await fetchLatestRelease(
        this,
        { user, repo },
        { sort, include_prereleases: includePre }
      )
      releases = [latestRelease]
    } else if (tag) {
      const wantedRelease = await this._requestJson({
        schema: releaseSchema,
        url: `/repos/${user}/${repo}/releases/tags/${tag}`,
        errorMessages: errorMessagesFor('repo or release not found'),
      })
      releases = [wantedRelease]
    } else {
      const allReleases = await this._requestJson({
        schema: releaseArraySchema,
        url: `/repos/${user}/${repo}/releases`,
        options: { searchParams: { per_page: 500 } },
        errorMessages: errorMessagesFor('repo not found'),
      })
      releases = allReleases
    }

    if (releases.length === 0) {
      throw new NotFound({ prettyMessage: 'no releases' })
    }

    const { downloads } = this.constructor.transform({
      releases,
      assetName,
    })

    return this.constructor.render({ tag, assetName, downloads })
  }
}
