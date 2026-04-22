import { starRating } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { pathParam, queryParam } from '../index.js'
import { BaseAmoService, description, queryParamSchema } from './amo-base.js'

export default class AmoRating extends BaseAmoService {
  static category = 'rating'
  static route = {
    base: 'amo',
    pattern: ':format(stars|rating)/:addonId',
    queryParamSchema,
  }

  static openApi = {
    '/amo/rating/{addonId}': {
      get: {
        summary: 'Mozilla Add-on Rating',
        description,
        parameters: [
          pathParam({ name: 'addonId', example: 'dustman' }),
          queryParam({
            name: 'registry',
            example: 'thunderbird',
            schema: { type: 'string', enum: ['firefox', 'thunderbird'] },
            description:
              'Registry to use. Can be `firefox` (default) or `thunderbird`.',
          }),
        ],
      },
    },
    '/amo/stars/{addonId}': {
      get: {
        summary: 'Mozilla Add-on Stars',
        description,
        parameters: [
          pathParam({ name: 'addonId', example: 'dustman' }),
          queryParam({
            name: 'registry',
            example: 'thunderbird',
            schema: { type: 'string', enum: ['firefox', 'thunderbird'] },
            description:
              'Registry to use. Can be `firefox` (default) or `thunderbird`.',
          }),
        ],
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

  async handle({ format, addonId }, { registry }) {
    const data = await this.fetch({ addonId, registry })
    return this.constructor.render({ format, rating: data.ratings.average })
  }
}
