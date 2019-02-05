'use strict'

const label = 'hsts'
const { BaseJsonService } = require('..')

const Joi = require('joi')
const schema = Joi.object({
  name: Joi.string().required(),
  status: Joi.string().required(),
}).required()

module.exports = class HSTS extends BaseJsonService {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'hsts',
      pattern: ':uri',
    }
  }

  static get examples() {
    return [
      {
        title: 'HSTS',
        namedParams: { uri: 'github.com' },
        staticPreview: this.render({ status: 'preloaded' }),
        keywords: ['hsts'],
      },
    ]
  }

  async fetch({ uri }) {
    return this._requestJson({
      schema,
      url: `https://hstspreload.org/api/v2/status?domain=${uri}`,
    })
  }

  async handle({ uri }) {
    const { status } = await this.fetch({ uri })
    return this.constructor.render({ status })
  }

  static render({ status }) {
    let color = 'red'

    if (status === 'preloaded') {
      color = 'brightgreen'
    } else if (status === 'pending') {
      color = 'yellow'
    }

    return { message: status, label, color }
  }
}
