import Joi from 'joi'
import { downloadCount } from '../color-formatters.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

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
    api_field: 'last_day',
    suffix: '/day',
  },
  dw: {
    api_field: 'last_week',
    suffix: '/week',
  },
  dm: {
    api_field: 'last_month',
    suffix: '/month',
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
      staticPreview: this.render({ period: 'dd', downloads: 14000 }),
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  static render({ period, downloads }) {
    return {
      message: `${metric(downloads)}${periodMap[period].suffix}`,
      color: downloadCount(downloads),
    }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      url: `https://pypistats.org/api/packages/${packageName.toLowerCase()}/recent`,
      schema,
      errorMessages: { 404: 'package not found' },
    })
  }

  async handle({ period, packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({
      period,
      downloads: json.data[periodMap[period].api_field],
    })
  }
}
