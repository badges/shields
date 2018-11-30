'use strict'

const BaseJsonService = require('../base-json')
const { metric } = require('../../lib/text-formatters')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')
const moment = require('moment')
const Joi = require('joi')

const tagSchema = Joi.object({
  total: Joi.number()
    .min(1)
    .required(),
}).required()

module.exports = class StackExchangeMonthlyQuestions extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return { label: 'stackoverflow' }
  }

  static get examples() {
    return [
      {
        title: 'Stack Exchange monthly questions',
        namedParams: { stackexchangesite: 'stackoverflow', query: 'momentjs' },
        staticExample: this.render({
          stackexchangesite: 'stackoverflow',
          numValue: 2000,
        }),
        keywords: ['stackexchange', 'stackoverflow'],
      },
    ]
  }

  static get route() {
    return {
      base: 'stackexchange',
      pattern: ':stackexchangesite/monthlyquestions/:query',
    }
  }

  static render({ stackexchangesite, numValue }) {
    const label = `${stackexchangesite} questions`

    return {
      label,
      message: `${metric(numValue)}/month`,
      color: floorCountColor(numValue, 1000, 10000, 20000),
    }
  }

  async handle({ stackexchangesite, query }) {
    const today = moment().toDate()
    const prevMonthStart = moment(today)
      .subtract(1, 'months')
      .startOf('month')
      .unix()
    const prevMonthEnd = moment(today)
      .subtract(1, 'months')
      .endOf('month')
      .unix()

    const parsedData = await this._requestJson({
      schema: tagSchema,
      options: {
        gzip: true,
        qs: {
          site: stackexchangesite,
          fromdate: prevMonthStart,
          todate: prevMonthEnd,
          filter: 'total',
          tagged: query,
        },
      },
      url: `https://api.stackexchange.com/2.2/questions`,
    })

    const numValue = parsedData.total

    return this.constructor.render({
      stackexchangesite,
      numValue,
    })
  }
}
