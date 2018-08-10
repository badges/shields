'use strict'

const Joi = require('joi')

const { BaseJsonService } = require('../base')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')

const ownerSchema = Joi.array().required()

module.exports = class GemOwner extends BaseJsonService {
  async handle({ user }) {
    const url = `https://rubygems.org/api/v1/owners/${user}/gems.json`
    const json = await this._requestJson({
      url,
      schema: ownerSchema,
    })
    const count = json.length

    return {
      message: count,
      color: floorCountColor(count, 10, 50, 100),
    }
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'gems' }
  }

  static get category() {
    return 'other'
  }

  static get url() {
    return {
      base: 'gem/u',
      format: '(.+)',
      capture: ['user'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Gems',
        previewUrl: 'raphink',
        keywords: ['ruby'],
      },
    ]
  }
}
