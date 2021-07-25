import Joi from 'joi'
import { coveragePercentage } from '../color-formatters.js'
import { BaseJsonService, InvalidParameter } from '../index.js'

const schema = Joi.object({
  uptime: Joi.number().min(0).max(100).required(),
}).required()

const pingpongDocumentation = `
<p>
  To see more details about this badge and obtain your api key, visit
  <a href="https://my.pingpong.one/integrations/badge-uptime/" target="_blank">https://my.pingpong.one/integrations/badge-uptime/</a>
</p>
`

export default class PingPongUptime extends BaseJsonService {
  static category = 'monitoring'
  static route = { base: 'pingpong/uptime', pattern: ':apiKey' }

  static examples = [
    {
      title: 'PingPong uptime (last 30 days)',
      namedParams: { apiKey: 'sp_2e80bc00b6054faeb2b87e2464be337e' },
      staticPreview: this.render({ uptime: 100 }),
      documentation: pingpongDocumentation,
      keywords: ['statuspage', 'status page'],
    },
  ]

  static defaultBadgeData = { label: 'uptime' }

  static validateApiKey({ apiKey }) {
    if (!apiKey.startsWith('sp_')) {
      throw new InvalidParameter({
        prettyMessage: 'invalid api key',
      })
    }
  }

  static render({ uptime }) {
    return {
      message: `${uptime}%`,
      color: coveragePercentage(uptime),
    }
  }

  async fetch({ apiKey }) {
    return this._requestJson({
      schema,
      url: `https://api.pingpong.one/widget/shields/uptime/${apiKey}`,
    })
  }

  async handle({ apiKey }) {
    this.constructor.validateApiKey({ apiKey })
    const { uptime } = await this.fetch({ apiKey })
    return this.constructor.render({ uptime })
  }
}
