'use strict'

const { starRating } = require('../../lib/text-formatters')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')
const { BaseAmoService, keywords } = require('./amo-base')

module.exports = class AmoRating extends BaseAmoService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'amo',
      pattern: ':format(stars|rating)/:addonId',
    }
  }

  static get examples() {
    return [
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
  }

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
