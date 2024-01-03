import { starRating } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { pathParams } from '../index.js'
import { BaseAmoService, description } from './amo-base.js'

export default class AmoRating extends BaseAmoService {
  static category = 'rating'
  static route = { base: 'amo', pattern: ':format(stars|rating)/:addonId' }

  static openApi = {
    '/amo/rating/{addonId}': {
      get: {
        summary: 'Mozilla Add-on Rating',
        description,
        parameters: pathParams({ name: 'addonId', example: 'dustman' }),
      },
    },
    '/amo/stars/{addonId}': {
      get: {
        summary: 'Mozilla Add-on Stars',
        description,
        parameters: pathParams({ name: 'addonId', example: 'dustman' }),
      },
    },
  }

  static _cacheLength = 7200

  static render({ format, rating }) {
    rating = Math.round(rating)
    return {
      label: format,
      message: format === 'stars' ? starRating(rating) : `${rating}/5`,
      color: floorCountColor(rating, 2, 3, 4),
    }
  }

  async handle({ format, addonId }) {
    const data = await this.fetch({ addonId })
    return this.constructor.render({ format, rating: data.ratings.average })
  }
}
