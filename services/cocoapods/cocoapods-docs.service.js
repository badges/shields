import Joi from 'joi'
import { coveragePercentage as coveragePercentageColor } from '../color-formatters.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  cocoadocs: Joi.object({
    doc_percent: Joi.number().allow(null).required(),
  }).required(),
}).required()

export default class CocoapodsDocs extends BaseJsonService {
  static category = 'analysis'
  static route = { base: 'cocoapods/metrics/doc-percent', pattern: ':spec' }

  static examples = [
    {
      title: 'Cocoapods doc percentage',
      namedParams: { spec: 'AFNetworking' },
      staticPreview: this.render({ percentage: 94 }),
    },
  ]

  static defaultBadgeData = { label: 'docs' }

  static render({ percentage }) {
    return {
      message: `${percentage}%`,
      color: coveragePercentageColor(percentage),
    }
  }

  async fetch({ spec }) {
    return this._requestJson({
      schema,
      url: `https://metrics.cocoapods.org/api/v1/pods/${spec}`,
    })
  }

  async handle({ spec }) {
    const data = await this.fetch({ spec })
    const percentage = data.cocoadocs.doc_percent || 0
    return this.constructor.render({ percentage })
  }
}
