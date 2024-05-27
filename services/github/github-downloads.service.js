import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { renderDownloadsBadge } from '../downloads.js'
import { NotFound, pathParam, queryParam } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { fetchLatestRelease } from './github-common-release.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const sortEnum = ['date', 'semver']

const queryParamSchema = Joi.object({
  sort: Joi.string()
    .valid(...sortEnum)
    .default('date'),
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
  Joi.array().length(0),
)

const variantParam = pathParam({
  name: 'variant',
  example: 'downloads',
  description: 'downloads including or excluding pre-releases',
  schema: { type: 'string', enum: ['downloads', 'downloads-pre'] },
})
const userParam = pathParam({ name: 'user', example: 'atom' })
const repoParam = pathParam({ name: 'repo', example: 'atom' })
const tagParam = pathParam({ name: 'tag', example: 'v0.190.0' })
const assetNameParam = pathParam({
  name: 'assetName',
  example: 'atom-amd64.deb',
})
const sortParam = queryParam({
  name: 'sort',
  example: 'semver',
  schema: { type: 'string', enum: sortEnum },
  description: 'Method used to determine latest release. Default: `date`',
})

export default class GithubDownloads extends GithubAuthV3Service {
  static category = 'downloads'
  static route = {
    base: 'github',
    pattern: ':variant(downloads|downloads-pre)/:user/:repo/:tag*/:assetName',
    queryParamSchema,
  }

  static openApi = {
    '/github/downloads/{user}/{repo}/total': {
      get: {
        summary: 'GitHub Downloads (all assets, all releases)',
        description: documentation,
        parameters: [userParam, repoParam],
      },
    },
    '/github/{variant}/{user}/{repo}/latest/total': {
      get: {
        summary: 'GitHub Downloads (all assets, latest release)',
        description: documentation,
        parameters: [variantParam, userParam, repoParam, sortParam],
      },
    },
    '/github/downloads/{user}/{repo}/{tag}/total': {
      get: {
        summary: 'GitHub Downloads (all assets, specific tag)',
        description: documentation,
        parameters: [userParam, repoParam, tagParam],
      },
    },
    '/github/downloads/{user}/{repo}/{assetName}': {
      get: {
        summary: 'GitHub Downloads (specific asset, all releases)',
        description: documentation,
        parameters: [userParam, repoParam, assetNameParam],
      },
    },
    '/github/{variant}/{user}/{repo}/latest/{assetName}': {
      get: {
        summary: 'GitHub Downloads (specific asset, latest release)',
        description: documentation,
        parameters: [
          variantParam,
          userParam,
          repoParam,
          assetNameParam,
          sortParam,
        ],
      },
    },
    '/github/downloads/{user}/{repo}/{tag}/{assetName}': {
      get: {
        summary: 'GitHub Downloads (specific asset, specific tag)',
        description: documentation,
        parameters: [userParam, repoParam, tagParam, assetNameParam],
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

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
              ({ name }) => name.toLowerCase() === assetName.toLowerCase(),
            )
      return (
        accum1 +
        filteredAssets.reduce(
          (accum2, { download_count: downloads }) => accum2 + downloads,
          0,
        )
      )
    }, 0)
    return { downloads }
  }

  async handle({ variant, user, repo, tag, assetName }, { sort }) {
    let releases
    if (tag === 'latest') {
      const includePre = variant === 'downloads-pre' || undefined
      const latestRelease = await fetchLatestRelease(
        this,
        { user, repo },
        { sort, include_prereleases: includePre },
      )
      releases = [latestRelease]
    } else if (tag) {
      const wantedRelease = await this._requestJson({
        schema: releaseSchema,
        url: `/repos/${user}/${repo}/releases/tags/${tag}`,
        httpErrors: httpErrorsFor('repo or release not found'),
      })
      releases = [wantedRelease]
    } else {
      const allReleases = await this._requestJson({
        schema: releaseArraySchema,
        url: `/repos/${user}/${repo}/releases`,
        options: { searchParams: { per_page: 500 } },
        httpErrors: httpErrorsFor('repo not found'),
      })
      releases = allReleases
    }

    if (releases.length === 0) {
      throw new NotFound({ prettyMessage: 'no releases found' })
    }

    const { downloads } = this.constructor.transform({
      releases,
      assetName,
    })

    return this.constructor.render({ tag, assetName, downloads })
  }
}
