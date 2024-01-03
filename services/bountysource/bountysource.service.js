import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({ activity_total: Joi.number().required() })

export default class Bountysource extends BaseJsonService {
  static category = 'funding'
  static route = { base: 'bountysource/team', pattern: ':team/activity' }

  static openApi = {
    '/bountysource/team/{team}/activity': {
      get: {
        summary: 'Bountysource',
        parameters: pathParams({
          name: 'team',
          example: 'mozilla-core',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'bounties' }

  static render({ total }) {
    return {
      message: metric(total),
      color: 'brightgreen',
    }
  }

  async fetch({ team }) {
    const url = `https://api.bountysource.com/teams/${team}`
    return this._requestJson({
      schema,
      url,
      options: {
        headers: { Accept: 'application/vnd.bountysource+json; version=2' },
      },
    })
  }

  async handle({ team }) {
    const json = await this.fetch({ team })
    return this.constructor.render({ total: json.activity_total })
  }
}
