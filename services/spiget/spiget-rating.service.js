'use strict'

const { starRating, metric } = require('../../lib/text-formatters')
const { floorCount } = require('../../lib/color-formatters')
const { BaseSpigetService, documentation, keywords } = require('./spiget-base')

module.exports = class SpigetRatings extends BaseSpigetService {
  static get route() {
    return {
      base: 'spiget',
      pattern: ':format(rating|stars)/:resourceId',
    }
  }

  async handle({ format, resourceId }) {
    const { rating } = await this.fetch({ resourceId })
    return this.constructor.render({
      format,
      total: rating.count,
      average: rating.average,
    })
  }

  static render({ format, total, average }) {
    const message =
      format === 'stars'
        ? starRating(average)
        : `${average}/5 (${metric(total)})`
    return {
      message,
      color: floorCount(average, 2, 3, 4),
    }
  }

  static get category() {
    return 'rating'
  }

  static get defaultBadgeData() {
    return { label: 'rating' }
  }

  static get examples() {
    return [
      {
        title: 'Spiget Stars',
        pattern: 'stars/:resourceId',
        namedParams: {
          resourceId: '9089',
        },
        staticPreview: this.render({
          format: 'stars',
          total: 325,
          average: 4.5,
        }),
        documentation,
      },
      {
        title: 'Spiget Rating',
        pattern: 'rating/:resourceId',
        namedParams: {
          resourceId: '9089',
        },
        staticPreview: this.render({ total: 325, average: 4.5 }),
        documentation,
        keywords,
      },
    ]
  }
}
