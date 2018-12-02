'use strict'

const BaseJsonService = require('../base-json')
const { metric } = require('../../lib/text-formatters')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')
const Joi = require('joi')

const tagSchema = Joi.object({
  items: Joi.array()
    .length(1)
    .items(
      Joi.object({
        count: Joi.number()
          .min(0)
          .required(),
      })
    )
    .required(),
}).required()

module.exports = class StackExchangeQuestions extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return { label: 'stackoverflow' }
  }

  static get examples() {
    return [
      {
        title: 'Stack Exchange questions',
        namedParams: { stackexchangesite: 'stackoverflow', query: 'gson' },
        staticExample: this.render({
          stackexchangesite: 'stackoverflow',
          query: 'gson',
          numValue: 10,
        }),
        keywords: ['stackexchange', 'stackoverflow'],
      },
    ]
  }

  static get route() {
    return {
      base: 'stackexchange',
      pattern: ':stackexchangesite/t/:query',
    }
  }

  static render({ stackexchangesite, query, numValue }) {
    const label = `${stackexchangesite} ${query} questions`

    return {
      label,
      message: metric(numValue),
      color: floorCountColor(numValue, 1000, 10000, 20000),
    }
  }

  async handle({ stackexchangesite, query }) {
    const path = `tags/${query}/info`

    const parsedData = await this._requestJson({
      schema: tagSchema,
      options: { gzip: true, qs: { site: stackexchangesite } },
      url: `https://api.stackexchange.com/2.2/${path}`,
    })

    const numValue = parsedData.items[0].count

    return this.constructor.render({
      stackexchangesite,
      query,
      numValue,
    })
  }
}
