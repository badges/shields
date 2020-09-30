'use strict'

const moment = require('moment')
const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')
const renderQuestionsBadge = require('./stackexchange-helpers')

const tagSchema = Joi.object({
  total: nonNegativeInteger,
}).required()

module.exports = class StackExchangeMonthlyQuestions extends BaseJsonService {
  static category = 'chat'

  static route = {
    base: 'stackexchange',
    pattern: ':stackexchangesite/qm/:query',
  }

  static examples = [
    {
      title: 'Stack Exchange monthly questions',
      namedParams: { stackexchangesite: 'stackoverflow', query: 'momentjs' },
      staticPreview: this.render({
        stackexchangesite: 'stackoverflow',
        query: 'momentjs',
        numValue: 2000,
      }),
      keywords: ['stackexchange', 'stackoverflow'],
    },
  ]

  static defaultBadgeData = {
    label: 'stackoverflow',
  }

  static render(props) {
    return renderQuestionsBadge({
      suffix: '/month',
      ...props,
    })
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
      query,
      numValue,
    })
  }
}
