import { starRating } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { BaseAmoService, keywords } from './amo-base.js'

export default class AmoRating extends BaseAmoService {
  static category = 'rating'
  static route = { base: 'amo', pattern: ':format(stars|rating)/:addonId' }

  static examples = [
    {
      title: 'Mozilla Add-on',
      pattern: 'rating/:addonId',
      namedParams: { addonId: 'dustman' },
      staticPreview: this.render({ format: 'rating', rating: 4 }),
      keywords,
    },
    {
      title: 'Mozilla Add-on',
      pattern: 'stars/:addonId',
      namedParams: { addonId: 'dustman' },
      staticPreview: this.render({ format: 'stars', rating: 4 }),
      keywords,
    },
  ]

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
