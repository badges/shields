import semver from 'semver'
import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { latest as latestVersion } from '../version.js'
import { nonNegativeInteger } from '../validators.js'
import {
  BaseJsonService,
  InvalidParameter,
  InvalidResponse,
  pathParams,
} from '../index.js'
import { description } from './gem-helpers.js'

const gemSchema = Joi.object({
  downloads: nonNegativeInteger,
  version_downloads: nonNegativeInteger,
}).required()

const versionSchema = Joi.array()
  .items(
    Joi.object({
      prerelease: Joi.boolean().required(),
      number: Joi.string().required(),
      downloads_count: nonNegativeInteger,
    }),
  )
  .min(1)
  .required()

export default class GemDownloads extends BaseJsonService {
  static category = 'downloads'
  static route = { base: 'gem', pattern: ':variant(dt|dtv|dv)/:gem/:version?' }
  static openApi = {
    '/gem/dt/{gem}': {
      get: {
        summary: 'Gem Total Downloads',
        description,
        parameters: pathParams({
          name: 'gem',
          example: 'rails',
        }),
      },
    },
    '/gem/dtv/{gem}': {
      get: {
        summary: 'Gem Downloads (for latest version)',
        description,
        parameters: pathParams({
          name: 'gem',
          example: 'rails',
        }),
      },
    },
    '/gem/dv/{gem}/{version}': {
      get: {
        summary: 'Gem Downloads (for specified version)',
        description,
        parameters: pathParams(
          {
            name: 'gem',
            example: 'rails',
          },
          {
            name: 'version',
            example: '4.1.0',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  static render({ variant, version, downloads }) {
    version = !version && variant === 'dtv' ? 'latest' : version
    return renderDownloadsBadge({ downloads, version })
  }

  async fetchDownloadCountForVersion({ gem, version }) {
    const json = await this._requestJson({
      url: `https://rubygems.org/api/v1/versions/${gem}.json`,
      schema: versionSchema,
      httpErrors: {
        404: 'gem not found',
      },
    })

    let wantedVersion
    if (version === 'stable') {
      wantedVersion = latestVersion(
        json
          .filter(({ prerelease }) => !prerelease)
          .map(({ number }) => number),
      )
    } else {
      wantedVersion = version
    }

    const versionData = json.find(({ number }) => number === wantedVersion)
    if (versionData) {
      return versionData.downloads_count
    } else {
      throw new InvalidResponse({
        prettyMessage: 'version not found',
      })
    }
  }

  async fetchDownloadCountForGem({ gem }) {
    const { downloads: totalDownloads, version_downloads: versionDownloads } =
      await this._requestJson({
        url: `https://rubygems.org/api/v1/gems/${gem}.json`,
        schema: gemSchema,
        httpErrors: {
          404: 'gem not found',
        },
      })
    return { totalDownloads, versionDownloads }
  }

  async handle({ variant, gem, version }) {
    let downloads
    if (variant === 'dv') {
      if (!version) {
        throw new InvalidParameter({
          prettyMessage: 'version downloads requires a version',
        })
      }
      if (version !== 'stable' && !semver.valid(version)) {
        throw new InvalidParameter({
          prettyMessage: 'version should be "stable" or valid semver',
        })
      }
      downloads = await this.fetchDownloadCountForVersion({ gem, version })
    } else {
      const { totalDownloads, versionDownloads } =
        await this.fetchDownloadCountForGem({ gem, variant })
      downloads = variant === 'dtv' ? versionDownloads : totalDownloads
    }
    return this.constructor.render({ variant, version, downloads })
  }
}
