import Joi from 'joi'
import { BaseJsonService, InvalidParameter, InvalidResponse } from '../index.js'

const schema = Joi.object({
  status: Joi.string().required(),
}).required()

const pingpongDocumentation = `
<p>
  To see more details about this badge and obtain your api key, visit
  <a href="https://my.pingpong.one/integrations/badge-status/" target="_blank">https://my.pingpong.one/integrations/badge-status/</a>
</p>
`

export default class PingPongStatus extends BaseJsonService {
  static category = 'monitoring'
  static route = { base: 'pingpong/status', pattern: ':apiKey' }

  static examples = [
    {
      title: 'PingPong status',
      namedParams: { apiKey: 'sp_2e80bc00b6054faeb2b87e2464be337e' },
      staticPreview: this.render({ status: 'Operational' }),
      documentation: pingpongDocumentation,
      keywords: ['statuspage', 'status page'],
    },
  ]

  static defaultBadgeData = { label: 'status' }

  static validateApiKey({ apiKey }) {
    if (!apiKey.startsWith('sp_')) {
      throw new InvalidParameter({
        prettyMessage: 'invalid api key',
      })
    }
  }

  static render({ status }) {
    switch (status) {
      case 'Operational':
        return { message: 'up', color: 'brightgreen' }
      case 'Major issues':
        return { message: 'issues', color: 'orange' }
      case 'Critical state':
        return { message: 'down', color: 'red' }
      case 'Maintenance mode':
        return { message: 'maintenance', color: 'lightgrey' }
      default:
        throw new InvalidResponse({
          prettyMessage: 'Unknown status received',
        })
    }
  }

  async fetch({ apiKey }) {
    return this._requestJson({
      schema,
      url: `https://api.pingpong.one/widget/shields/status/${apiKey}`,
    })
  }

  async handle({ apiKey }) {
    this.constructor.validateApiKey({ apiKey })
    const { status } = await this.fetch({ apiKey })
    return this.constructor.render({ status })
  }
}
