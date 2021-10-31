import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'

const keywords = ['python']

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

  static examples = [
    {
      title: 'PyPI - Downloads',
      namedParams: {
        period: 'dd',
        packageName: 'Django',
      },
      staticPreview: renderDownloadsBadge({
        interval: 'day',
        downloads: 14000,
      }),
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async fetch({ packageName }) {
    return this._requestJson({
      url: `https://pypistats.org/api/packages/${packageName.toLowerCase()}/recent`,
      schema,
      errorMessages: { 404: 'package not found' },
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
