'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  currency_sign: Joi.string().required(),
  amount: Joi.number().required(),
  multiplier: Joi.string()
    .allow('')
    .required(),
  currency_abbreviation: Joi.string().required(),
}).required()

module.exports = class Codetally extends BaseJsonService {
  static get category() {
    return 'funding'
  }

  static get route() {
    return {
      base: 'codetally',
      pattern: ':owner/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'Codetally',
        namedParams: {
          owner: 'triggerman722',
          repo: 'colorstrap',
        },
        staticPreview: this.render({
          currency: '$',
          amount: 4.68,
          multiplier: 'K',
        }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'codetally',
      color: '#2E8B57',
    }
  }

  static render({ currency, amount, multiplier }) {
    return {
      message: `${currency}${amount.toFixed(2)} ${multiplier}`,
    }
  }

  async handle({ owner, repo }) {
    const url = `http://www.codetally.com/formattedshield/${owner}/${repo}`
    const json = await this._requestJson({
      url,
      schema,
      errorMessages: {
        404: 'repo not found',
        503: 'repo not found',
      },
    })

    return this.constructor.render({
      currency: json.currency_sign,
      amount: json.amount,
      multiplier: json.multiplier,
    })
  }
}
