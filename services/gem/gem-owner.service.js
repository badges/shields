'use strict'

const Joi = require('joi')
const { floorCount: floorCountColor } = require('../color-formatters')
const { BaseJsonService } = require('..')

const ownerSchema = Joi.array().required()

module.exports = class GemOwner extends BaseJsonService {
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
