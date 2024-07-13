import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParam } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { pypiPackageParam } from './pypi-base.js'

const schema = Joi.object({
  data: Joi.object({
    last_day: nonNegativeInteger,
    last_week: nonNegativeInteger,
    last_month: nonNegativeInteger,
  }),
}).required()

const periodMap = {
  dd: {
    apiField: 'last_day',
    interval: 'day',
  },
  dw: {
    apiField: 'last_week',
    interval: 'week',
  },
  dm: {
    apiField: 'last_month',
    interval: 'month',
  },
}

// this badge uses PyPI Stats instead of the PyPI API
// so it doesn't extend PypiBase
export default class PypiDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'pypi',
    pattern: ':period(dd|dw|dm)/:packageName',
  }

  static openApi = {
    '/pypi/{period}/{packageName}': {
      get: {
        summary: 'PyPI - Downloads',
        description:
          'Python package downloads from [pypistats](https://pypistats.org/)',
        parameters: [
          pathParam({
            name: 'period',
            example: 'dd',
            schema: { type: 'string', enum: this.getEnum('period') },
            description: 'Daily, Weekly, or Monthly downloads',
          }),
          pypiPackageParam,
        ],
      },
    },
  }

  static _cacheLength = 28800

  static defaultBadgeData = { label: 'downloads' }

  async fetch({ packageName }) {
    return this._requestJson({
      url: `https://pypistats.org/api/packages/${packageName.toLowerCase()}/recent`,
      schema,
      httpErrors: { 404: 'package not found' },
    })
  }

  async handle({ period, packageName }) {
    const { apiField, interval } = periodMap[period]
    const { data } = await this.fetch({ packageName })
    return renderDownloadsBadge({
      downloads: data[apiField],
      interval,
    })
  }
}
