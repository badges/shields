'use strict'

const { BaseJsonService } = require('..')

const Joi = require('joi')
const schema = Joi.object({
  name: Joi.string().required(),
  status: Joi.string().required(),
}).required()

module.exports = class HSTS extends BaseJsonService {
  static get route() {
    return {
      base: 'hsts',
      pattern: ':uri',
    }
  }

  static get category() {
    return 'monitoring'
  }

  async handle({ uri }) {
    const { status } = await this.fetch({ uri })
    return this.constructor.render({ status })
  }

  async fetch({ uri }) {
    return this._requestJson({
      schema,
      url: `https://hstspreload.org/api/v2/status?domain=${uri}`,
    })
  }

  static async render({ status }) {
    const label = 'hsts'
    let color = 'lightgrey'

    if (status === 'unknown') {
      color = 'red'
    } else if (status === 'preloaded') {
      color = 'brightgreen'
    } else if (status === 'pending') {
      color = 'green'
    }

    return {
      label,
      message: status,
      color,
    }
  }

  static get examples() {
    return [
      {
        title: 'HSTS',
        namedParams: { uri: 'github.com' },
        staticPreview: {
          label: 'hsts',
          message: 'preloaded',
          color: 'brightgreen',
        },
        keywords: ['hsts'],
      },
    ]
  }
}
