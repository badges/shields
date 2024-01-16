import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.array()
  .items(Joi.array().items(Joi.number().required(), Joi.number().required()))
  .required()

export default class BStatsPlayers extends BaseJsonService {
  static category = 'other'
  static route = { base: 'bstats/players', pattern: ':pluginid' }

  static openApi = {
    '/bstats/players/{pluginid}': {
      get: {
        summary: 'bStats Players',
        parameters: pathParams({
          name: 'pluginid',
          example: '1',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'players', color: 'blue' }

  static render({ players }) {
    return {
      message: metric(players),
    }
  }

  async fetch({ pluginid }) {
    const url = `https://bstats.org/api/v1/plugins/${pluginid}/charts/players/data`

    return this._requestJson({
      schema,
      options: {
        searchParams: {
          maxElements: 1,
        },
      },
      url,
    })
  }

  transform({ json }) {
    const players = json[0][1]
    return { players }
  }

  async handle({ pluginid }) {
    const json = await this.fetch({ pluginid })
    const { players } = this.transform({ json })
    return this.constructor.render({ players })
  }
}
