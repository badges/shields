'use strict'

const BaseJsonService = require('../base-json')
const renderQuestionsBadge = require('./stackexchange-helpers')
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
    return 'chat'
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

  static render(props) {
    return renderQuestionsBadge({
      suffix: '',
      ...props,
    })
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
