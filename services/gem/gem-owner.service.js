import Joi from 'joi'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { metric } from '../text-formatters.js'
import { BaseJsonService, pathParams } from '../index.js'
import { description } from './gem-helpers.js'

const ownerSchema = Joi.array().required()

export default class GemOwner extends BaseJsonService {
  static category = 'other'
  static route = { base: 'gem/u', pattern: ':user' }
  static openApi = {
    '/gem/u/{user}': {
      get: {
        summary: 'Gem Owner',
        description,
        parameters: pathParams({
          name: 'user',
          example: 'raphink',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'gems' }

  static render({ count }) {
    return {
      message: metric(count),
      color: floorCountColor(count, 10, 50, 100),
    }
  }

  async fetch({ user }) {
    const url = `https://rubygems.org/api/v1/owners/${user}/gems.json`
    return this._requestJson({
      url,
      schema: ownerSchema,
    })
  }

  async handle({ user }) {
    const json = await this.fetch({ user })
    return this.constructor.render({ count: json.length })
  }
}
