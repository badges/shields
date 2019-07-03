'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { floorCount: floorCountColor } = require('../color-formatters')
const { BaseJsonService } = require('..')

const reputationSchema = Joi.object({
  items: Joi.array()
    .length(1)
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
    return 'chat'
  }

  static get route() {
    return {
      base: 'stackexchange',
      pattern: ':stackexchangesite/r/:query',
    }
  }

  static get examples() {
    return [
      {
        title: 'Stack Exchange reputation',
        namedParams: { stackexchangesite: 'stackoverflow', query: '123' },
        staticPreview: this.render({
          stackexchangesite: 'stackoverflow',
          numValue: 10,
        }),
        keywords: ['stackexchange', 'stackoverflow'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'stackoverflow' }
  }

  static render({ stackexchangesite, numValue }) {
    const label = `${stackexchangesite} reputation`

    return {
      label,
      message: metric(numValue),
      color: floorCountColor(numValue, 1000, 10000, 20000),
    }
  }

  async handle({ stackexchangesite, query }) {
    const path = `users/${query}`

    const parsedData = await this._requestJson({
      schema: reputationSchema,
      options: { gzip: true, qs: { site: stackexchangesite } },
      url: `https://api.stackexchange.com/2.2/${path}`,
      errorMessages: {
        400: 'invalid parameters',
      },
    })

    const numValue = parsedData.items[0].reputation

    return this.constructor.render({
      stackexchangesite,
      numValue,
    })
  }
}
