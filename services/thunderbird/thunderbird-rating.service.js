import { starRating } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { pathParams } from '../index.js'
import { BaseThunderbirdService, description } from './thunderbird-base.js'

export default class ThunderbirdRating extends BaseThunderbirdService {
  static category = 'rating'
  static route = { base: 'thunderbird', pattern: ':format(stars|rating)/:addonId' }

  static openApi = {
    '/thunderbird/rating/{addonId}': {
      get: {
        summary: 'Thunderbird Add-on Rating',
        description,
        parameters: pathParams({ name: 'addonId', example: 'dustman' }),
      },
    },
    '/thunderbird/stars/{addonId}': {
      get: {
        summary: 'Thunderbird Add-on Stars',
        description,
        parameters: pathParams({ name: 'addonId', example: 'dustman' }),
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
