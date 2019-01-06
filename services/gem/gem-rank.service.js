'use strict'

const Joi = require('joi')

const BaseJsonService = require('../base-json')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')
const { ordinalNumber } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators')

const keywords = ['ruby']

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
  async fetch({ period, gem }) {
    let endpoint, schema
    if (period === 'rt') {
      endpoint = 'total_ranking.json'
      schema = totalSchema
    } else {
      endpoint = 'daily_ranking.json'
      schema = dailySchema
    }

    return this._requestJson({
      url: `http://bestgems.org/api/v1/gems/${gem}/${endpoint}`,
      schema,
    })
  }

  static render({ period, rank }) {
    const count = Math.floor(100000 / rank)
    let message = ordinalNumber(rank)
    message += period === 'rt' ? '' : ' daily'
    return {
      message,
      color: floorCountColor(count, 10, 50, 100),
    }
  }

  async handle({ period, gem }) {
    const json = await this.fetch({ period, gem })
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

  static get route() {
    return {
      base: 'gem',
      pattern: ':period(rt|rd)/:gem',
    }
  }

  static get examples() {
    return [
      {
        title: 'Gem download rank',
        pattern: 'rt/:gem',
        namedParams: {
          gem: 'puppet',
        },
        staticExample: this.render({ period: 'rt', rank: 332 }),
        keywords,
      },
      {
        title: 'Gem download rank (daily)',
        pattern: 'rd/:gem',
        namedParams: {
          gem: 'facter',
        },
        staticExample: this.render({ period: 'rd', rank: 656 }),
        keywords,
      },
    ]
  }
}
