'use strict'

const { BaseSpigetService, documentation } = require('./spiget-base')

const { starRating, metric } = require('../../lib/text-formatters')
const { floorCount } = require('../../lib/color-formatters')

class SpigetRatingsBase extends BaseSpigetService {
  async handle({ resourceid }) {
    const { rating } = await this.fetch({ resourceid })
    return this.constructor.render({
      total: rating.count,
      average: rating.average,
    })
  }

  static render({ total, average }) {
    return {
      message: `${average}/5 (${metric(total)})`,
      color: floorCount(average, 2, 3, 4),
    }
  }

  static get category() {
    return 'rating'
  }

  static get defaultBadgeData() {
    return { label: 'rating' }
  }
}

class SpigetRating extends SpigetRatingsBase {
  static get route() {
    return {
      base: 'spiget/rating',
      pattern: ':resourceid',
    }
  }

  static get examples() {
    return [
      {
        title: 'Spiget Rating',
        namedParams: {
          resourceid: '9089',
        },
        staticPreview: this.render({ total: 325, average: 4.5 }),
        documentation,
      },
    ]
  }
}

class SpigetStars extends SpigetRatingsBase {
  static render({ total, average }) {
    const rating = (average / 100) * 5
    return {
      message: starRating(average),
      color: floorCount(rating, 2, 3, 4),
    }
  }

  static get route() {
    return {
      base: 'spiget/stars',
      pattern: ':resourceid',
    }
  }

  static get examples() {
    return [
      {
        title: 'Spiget Stars',
        namedParams: {
          resourceid: '9089',
        },
        staticPreview: this.render({ total: 325, average: 4.5 }),
        documentation,
      },
    ]
  }
}

module.exports = { SpigetRating, SpigetStars }
