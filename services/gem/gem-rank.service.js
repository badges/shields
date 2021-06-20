import Joi from 'joi'
import { floorCount } from '../color-formatters.js'
import { ordinalNumber } from '../text-formatters.js'
import { BaseJsonService, InvalidResponse } from '../index.js'

const keywords = ['ruby']

const totalSchema = Joi.array()
  .items(
    Joi.object({
      total_ranking: Joi.number().integer().min(0).allow(null),
    })
  )
  .min(1)
  .required()
const dailySchema = Joi.array()
  .items(
    Joi.object({
      daily_ranking: Joi.number().integer().min(0).allow(null),
    })
  )
  .min(1)
  .required()

export default class GemRank extends BaseJsonService {
  static category = 'downloads'
  static route = { base: 'gem', pattern: ':period(rt|rd)/:gem' }
  static examples = [
    {
      title: 'Gem download rank',
      pattern: 'rt/:gem',
      namedParams: {
        gem: 'puppet',
      },
      staticPreview: this.render({ period: 'rt', rank: 332 }),
      keywords,
    },
    {
      title: 'Gem download rank (daily)',
      pattern: 'rd/:gem',
      namedParams: {
        gem: 'facter',
      },
      staticPreview: this.render({ period: 'rd', rank: 656 }),
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'rank' }

  static render({ period, rank }) {
    const count = Math.floor(100000 / rank)
    let message = ordinalNumber(rank)
    message += period === 'rt' ? '' : ' daily'
    return {
      message,
      color: floorCount(count, 10, 50, 100),
    }
  }

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

  async handle({ period, gem }) {
    const json = await this.fetch({ period, gem })
    const rank = period === 'rt' ? json[0].total_ranking : json[0].daily_ranking
    if (rank == null) {
      throw new InvalidResponse({ prettyMessage: 'invalid rank' })
    }
    return this.constructor.render({ period, rank })
  }
}
