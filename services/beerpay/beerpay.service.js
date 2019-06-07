'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  total_amount: Joi.number()
    .min(0)
    .required(),
}).required()

module.exports = class Beerpay extends BaseJsonService {
  static get category() {
    return 'funding'
  }

  static get route() {
    return {
      base: 'beerpay',
      pattern: ':user/:project',
    }
  }

  static get examples() {
    return [
      {
        title: 'Beerpay',
        namedParams: { user: 'hashdog', project: 'scrapfy-chrome-extension' },
        staticPreview: this.render({ totalAmount: 10 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'beerpay',
    }
  }

  static render({ totalAmount }) {
    return {
      message: `$${totalAmount}`,
      color: totalAmount > 0 ? 'blue' : 'red',
    }
  }

  async handle({ user, project }) {
    // e.g. JSON response: https://beerpay.io/api/v1/beerpay/projects/beerpay.io
    // e.g. SVG badge: https://beerpay.io/beerpay/beerpay.io/badge.svg?style=flat-square
    const { total_amount: totalAmount } = await this._requestJson({
      schema,
      url: `https://beerpay.io/api/v1/${user}/projects/${project}`,
      errorMessages: {
        404: 'project not found',
      },
    })
    return this.constructor.render({ totalAmount })
  }
}
