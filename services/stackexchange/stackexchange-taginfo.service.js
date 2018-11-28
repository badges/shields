'use strict'

const BaseJsonService = require('../base-json')
const { metric } = require('../../lib/text-formatters')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')
const Joi = require('joi')

const tagSchema = Joi.object({
  items: Joi.array()
    .min(1)
    .items(
      Joi.object({
        count: Joi.number()
          .min(0)
          .required(),
      })
    )
    .required(),
}).required()

module.exports = class StackExchangeTagInfo extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return { label: 'stackoverflow' }
  }

  static get examples() {
    return [
      {
        title: 'StackOverflow',
        namedParams: { stackexchangesite: 'stackoverflow', query: 'gson' },
        staticExample: this.render({
          label: 'stackoverflow gson questions',
          numvalue: 1000,
          color: floorCountColor(1000, 10000, 20000),
        }),
        keywords: ['stackexchange', 'stackoverflow'],
      },
    ]
  }

  static get route() {
    return {
      base: 'stackexchange/t',
      pattern: ':stackexchangesite/:query',
    }
  }

  static render({ label, numValue, color }) {
    return {
      label,
      message: metric(numValue),
      color,
    }
  }

  async handle({ stackexchangesite, query }) {
    const path = `tags/${query}/info`
    const label = `${stackexchangesite} ${query} questions`

    const parsedData = await this._requestJson({
      schema: tagSchema,
      options: { gzip: true },
      url: `https://api.stackexchange.com/2.2/${path}?&site=${stackexchangesite}`,
      errorMessages: {
        503: 'inaccessible',
      },
    })

    const numValue = parsedData.items[0].count

    return this.constructor.render({
      label,
      numValue,
      color: floorCountColor(1000, 10000, 20000),
    })
  }
}
