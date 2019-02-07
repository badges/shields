'use strict'

const label = 'hsts preloaded'
const { BaseJsonService } = require('..')

const Joi = require('joi')
const schema = Joi.object({
  status: Joi.string().required(),
}).required()

module.exports = class HSTS extends BaseJsonService {
  static get category() {
    return 'monitoring'
  }

  static get route() {
    return {
      base: 'hsts',
      pattern: ':domain',
    }
  }

  static get examples() {
    return [
      {
        title: 'Chromium HSTS preload',
        namedParams: { domain: 'github.com' },
        staticPreview: this.render({ status: 'preloaded' }),
        keywords: ['security'],
      },
    ]
  }

  async fetch({ domain }) {
    return this._requestJson({
      schema,
      url: `https://hstspreload.org/api/v2/status?domain=${domain}`,
    })
  }

  async handle({ domain }) {
    const { status } = await this.fetch({ domain })
    return this.constructor.render({ status })
  }

  static render({ status }) {
    let color = 'red'

    if (status === 'unknown') {
      status = 'no'
    } else if (status === 'preloaded') {
      status = 'yes'
      color = 'brightgreen'
    } else if (status === 'pending') {
      color = 'yellow'
    }

    return { message: status, label, color }
  }
}
