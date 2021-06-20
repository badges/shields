import Joi from 'joi'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { BaseJsonService } from '../index.js'

const ownerSchema = Joi.array().required()

export default class GemOwner extends BaseJsonService {
  static category = 'other'
  static route = { base: 'gem/u', pattern: ':user' }
  static examples = [
    {
      title: 'Gems',
      namedParams: { user: 'raphink' },
      staticPreview: this.render({ count: 34 }),
      keywords: ['ruby'],
    },
  ]

  static defaultBadgeData = { label: 'gems' }

  static render({ count }) {
    return {
      message: count,
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
