'use strict'

const Joi = require('joi')

const BaseJsonService = require('../base-json')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')
const { ordinalNumber } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators')

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
  async fetch({ period, repo }) {
    const totalRank = period === 'rt'
    const endpoint = totalRank ? '/total_ranking.json' : '/daily_ranking.json'
    const url = `http://bestgems.org/api/v1/gems/${repo}${endpoint}`
    const schema = totalRank ? totalSchema : dailySchema
    return this._requestJson({
      url,
      schema,
    })
  }

  static render({ period, rank }) {
    const count = Math.floor(100000 / rank)
    let message = ordinalNumber(rank)
    message += period === 'rt' ? '' : ' daily'
    return {
      message: message,
      color: floorCountColor(count, 10, 50, 100),
    }
  }

  async handle({ period, repo }) {
    const json = await this.fetch({ period, repo })
    const rank = period === 'rt' ? json[0].total_ranking : json[0].daily_ranking
    return this.constructor.render({ period, rank })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'rank' }
  }

  static get category() {
    return 'downloads'
  }

  static get url() {
    return {
      base: 'gem',
      format: '(rt|rd)/(.+)',
      capture: ['period', 'repo'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Gem download rank',
        exampleUrl: 'rt/puppet',
        urlPattern: 'rt/:package',
        staticExample: this.render({ period: 'rt', rank: 332 }),
        keywords: ['ruby'],
      },
      {
        title: 'Gem download rank (daily)',
        exampleUrl: 'rd/facter',
        urlPattern: 'rd/:package',
        staticExample: this.render({ period: 'rd', rank: 656 }),
        keywords: ['ruby'],
      },
    ]
  }
}
