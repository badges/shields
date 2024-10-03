import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'

const schema = Joi.object({
  total_downloads: nonNegativeInteger,
}).required()

const description = `
Python package total downloads from [Pepy](https://www.pepy.tech/).

Download stats from pepy count package downloads from PyPI and known mirrors.`

export default class PepyDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'pepy',
    pattern: 'dt/:packageName',
  }

  static auth = {
    passKey: 'pepy_key',
    authorizedOrigins: ['https://api.pepy.tech'],
    isRequired: true,
  }

  static openApi = {
    '/pepy/dt/{packageName}': {
      get: {
        summary: 'Pepy Total Downloads',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'django',
        }),
      },
    },
  }

  static _cacheLength = 21600

  static defaultBadgeData = { label: 'downloads' }

  async fetch({ packageName }) {
    return this._requestJson(
      this.authHelper.withApiKeyHeader({
        url: `https://api.pepy.tech/api/v2/projects/${packageName}`,
        schema,
      }),
    )
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return renderDownloadsBadge({
      downloads: data.total_downloads,
    })
  }
}
