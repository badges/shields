'use strict'

const { renderVersionBadge } = require('..//version')
const { BaseJsonService, InvalidParameter } = require('..')

const Joi = require('joi')
const schema = Joi.object({
  message: Joi.string().required(),
  color: Joi.string().required(),
}).required()

const pingpongDocumentation = `
<p>
  To see more details about this badge and obtain your api key, visit
  <a href="https://my.pingpong.one/integrations/badge-uptime/" target="_blank">https://my.pingpong.one/integrations/badge-uptime/</a>
</p>
`

module.exports = class PingPongUptime extends BaseJsonService {
  static category = 'monitoring'
  static route = { base: 'pingpong/uptime', pattern: ':apiKey' }
  static defaultBadgeData = { label: 'uptime' }

  static examples = [
    {
      title: 'PingPong uptime (last 30 days)',
      namedParams: { apiKey: 'sp_eb705b7c189f42e3b574dc790291c33f' },
      staticPreview: this.render({ message: '100%', color: 'brightgreen' }),
      documentation: pingpongDocumentation,
      keywords: ['statuspage', 'status page'],
    },
  ]

  static validateApiKey({ apiKey }) {
    if (!apiKey.startsWith('sp_')) {
      throw new InvalidParameter({
        prettyMessage: 'invalid api key',
      })
    }
  }

  static render({ message, color }) {
    return {
      label: 'uptime',
      message: message,
      color: color,
    }
  }

  async fetch({ apiKey }) {
    return this._requestJson({
      schema,
      url: `https://api.pingpong.one/widget/badge/uptime/${apiKey}`,
    })
  }

  async handle({ apiKey }) {
    this.constructor.validateApiKey({ apiKey })
    const { message, color } = await this.fetch({ apiKey })
    return this.constructor.render({ message, color })
  }
}
