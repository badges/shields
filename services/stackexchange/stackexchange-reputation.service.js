'use strict'

const BaseJsonService = require('../base-json')
const { metric } = require('../../lib/text-formatters')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')
const Joi = require('joi')

const reputationSchema = Joi.object({
  items: Joi.array()
    .min(1)
    .items(
      Joi.object({
        reputation: Joi.number()
          .min(0)
          .required(),
      })
    )
    .required(),
}).required()

module.exports = class StackExchangeReputation extends BaseJsonService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'stackexchange/r',
      pattern: ':stackexchangesite/:query',
    }
  }

  static get defaultBadgeData() {
    return { label: 'stackoverflow' }
  }

  static get examples() {
    return [
      {
        title: 'StackOverflow',
        namedParams: { stackexchangesite: 'stackoverflow', query: '123' },
        staticExample: this.render({
          label: 'stackoverflow reputation',
          numvalue: 10,
          color: floorCountColor(1000, 10000, 20000),
        }),
        keywords: ['stackexchange', 'stackoverflow'],
      },
    ]
  }

  static render({ label, numValue, color }) {
    return {
      label,
      message: metric(numValue),
      color,
    }
  }

  async handle({ stackexchangesite, query }) {
    const path = `users/${query}`
    const label = `${stackexchangesite} reputation`

    const parsedData = await this._requestJson({
      schema: reputationSchema,
      options: { gzip: true },
      url: `https://api.stackexchange.com/2.2/${path}?&site=${stackexchangesite}`,
      errorMessages: {
        400: 'invalid parameters',
        503: 'inaccessible',
      },
    })

    const numValue = parsedData.items[0].reputation

    return this.constructor.render({
      label,
      numValue,
      color: floorCountColor(1000, 10000, 20000),
    })
  }
}
