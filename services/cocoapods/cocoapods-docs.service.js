'use strict'

const Joi = require('@hapi/joi')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../color-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  cocoadocs: Joi.object({
    doc_percent: Joi.number()
      .allow(null)
      .required(),
  }).required(),
}).required()

module.exports = class CocoapodsDocs extends BaseJsonService {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'cocoapods/metrics/doc-percent',
      pattern: ':spec',
    }
  }

  static get examples() {
    return [
      {
        title: 'Cocoapods doc percentage',
        namedParams: { spec: 'AFNetworking' },
        staticPreview: this.render({ percentage: 94 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'docs' }
  }

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
