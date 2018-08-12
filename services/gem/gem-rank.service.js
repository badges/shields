'use strict'

const Joi = require('joi')

const BaseJsonService = require('../base-json')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')
const { ordinalNumber } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators.js')

const totalSchema = Joi.array()
  .items(
    Joi.object({
      total_ranking: nonNegativeInteger,
    })
  )
  .min(1)
  .required()
const dailySchema = Joi.array()
  .items(
    Joi.object({
      daily_ranking: nonNegativeInteger,
    })
  )
  .min(1)
  .required()

module.exports = class GemRank extends BaseJsonService {
  async fetch({ info, repo }) {
    const totalRank = info === 'rt'
    const endpoint = totalRank ? '/total_ranking.json' : '/daily_ranking.json'
    const url = `http://bestgems.org/api/v1/gems/${repo}${endpoint}`
    const schema = totalRank ? totalSchema : dailySchema
    return this._requestJson({
      url,
      schema,
    })
  }

  static render({ message, count }) {
    return {
      message: message,
      color: floorCountColor(count, 10, 50, 100),
    }
  }

  async handle({ info, repo }) {
    const json = await this.fetch({ info, repo })

    const totalRank = info === 'rt'
    const rank = totalRank ? json[0].total_ranking : json[0].daily_ranking
    const count = Math.floor(100000 / rank)
    let message = ordinalNumber(rank)
    message += totalRank ? '' : ' daily'

    return this.constructor.render({ message, count })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'rank' }
  }

  static get category() {
    return 'rating'
  }

  static get url() {
    return {
      base: 'gem',
      format: '(rt|rd)/(.+)',
      capture: ['info', 'repo'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Gems',
        previewUrl: 'rt/puppet',
        keywords: ['ruby'],
      },
      {
        title: 'Gems',
        previewUrl: 'rd/facter',
        keywords: ['ruby'],
      },
    ]
  }
}
