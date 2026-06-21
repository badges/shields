import { starRating } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { pathParams } from '../index.js'
import { BaseAtnService, description } from './atn-base.js'

export default class AtnRating extends BaseAtnService {
  static category = 'rating'
  static route = { base: 'atn', pattern: ':format(stars|rating)/:addonId' }

  static openApi = {
    '/atn/rating/{addonId}': {
      get: {
        summary: 'Thunderbird Add-on Rating',
        description,
        parameters: pathParams({
          name: 'addonId',
          example: 'unicodify-text-transformer',
        }),
      },
    },
    '/atn/stars/{addonId}': {
      get: {
        summary: 'Thunderbird Add-on Stars',
        description,
        parameters: pathParams({
          name: 'addonId',
          example: 'unicodify-text-transformer',
        }),
      },
    },
  }

  static _cacheLength = 7200

  static render({ format, rating }) {
    return {
      label: format,
      message:
        format === 'stars'
          ? starRating(rating)
          : `${Math.round(rating * 10) / 10}/5`,
      color: floorCountColor(rating, 2, 3, 4),
    }
  }

  async handle({ format, addonId }) {
    const data = await this.fetch({ addonId })
    return this.constructor.render({ format, rating: data.ratings.average })
  }
}
