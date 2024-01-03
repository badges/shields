import Joi from 'joi'
import { coveragePercentage } from '../color-formatters.js'
import { pathParams } from '../index.js'
import { BasePingPongService, baseUrl, description } from './pingpong-base.js'

const schema = Joi.object({
  uptime: Joi.number().min(0).max(100).required(),
}).required()

export default class PingPongUptime extends BasePingPongService {
  static route = { base: 'pingpong/uptime', pattern: ':apiKey' }

  static openApi = {
    '/pingpong/uptime/{apiKey}': {
      get: {
        summary: 'PingPong uptime (last 30 days)',
        description,
        parameters: pathParams({
          name: 'apiKey',
          example: 'sp_2e80bc00b6054faeb2b87e2464be337e',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'uptime' }

  static render({ uptime }) {
    return {
      message: `${uptime}%`,
      color: coveragePercentage(uptime),
    }
  }

  async fetch({ apiKey }) {
    return this._requestJson({
      schema,
      url: `${baseUrl}/uptime/${apiKey}`,
    })
  }

  async handle({ apiKey }) {
    this.constructor.validateApiKey({ apiKey })
    const { uptime } = await this.fetch({ apiKey, schema })
    return this.constructor.render({ uptime })
  }
}
