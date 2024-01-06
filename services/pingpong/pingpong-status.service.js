import Joi from 'joi'
import { InvalidResponse, pathParams } from '../index.js'
import { BasePingPongService, baseUrl, description } from './pingpong-base.js'

const schema = Joi.object({
  status: Joi.string().required(),
}).required()

export default class PingPongStatus extends BasePingPongService {
  static route = { base: 'pingpong/status', pattern: ':apiKey' }

  static openApi = {
    '/pingpong/status/{apiKey}': {
      get: {
        summary: 'PingPong status',
        description,
        parameters: pathParams({
          name: 'apiKey',
          example: 'sp_2e80bc00b6054faeb2b87e2464be337e',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'status' }

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
      url: `${baseUrl}/status/${apiKey}`,
    })
  }

  async handle({ apiKey }) {
    this.constructor.validateApiKey({ apiKey })
    const { status } = await this.fetch({ apiKey, schema })
    return this.constructor.render({ status })
  }
}
