'use strict'

const { floorCount: floorCountColor } = require('../color-formatters')
const { metric, starRating } = require('../text-formatters')
const BaseChromeWebStoreService = require('./chrome-web-store-base')

class BaseChromeWebStoreRating extends BaseChromeWebStoreService {
  static get category() {
    return 'rating'
  }

  static get defaultBadgeData() {
    return { label: 'rating' }
  }
}

class ChromeWebStoreRating extends BaseChromeWebStoreRating {
  static get route() {
    return {
      base: 'chrome-web-store/rating',
      pattern: ':storeId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Chrome Web Store',
        namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
        staticPreview: this.render({ rating: '3.67' }),
      },
    ]
  }

  static render({ rating }) {
    rating = Math.round(rating * 100) / 100
    return {
      message: `${rating}/5`,
      color: floorCountColor(rating, 2, 3, 4),
    }
  }

  async handle({ storeId }) {
    const { ratingValue } = await this.fetch({ storeId })
    return this.constructor.render({ rating: ratingValue })
  }
}

class ChromeWebStoreRatingCount extends BaseChromeWebStoreRating {
  static get route() {
    return {
      base: 'chrome-web-store/rating-count',
      pattern: ':storeId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Chrome Web Store',
        namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
        staticPreview: this.render({ ratingCount: 12 }),
      },
    ]
  }

  static render({ ratingCount }) {
    return {
      message: `${metric(ratingCount)} total`,
      color: floorCountColor(ratingCount, 5, 50, 500),
    }
  }

  async handle({ storeId }) {
    const { ratingCount } = await this.fetch({ storeId })
    return this.constructor.render({ ratingCount })
  }
}

class ChromeWebStoreRatingStars extends BaseChromeWebStoreRating {
  static get route() {
    return {
      base: 'chrome-web-store/stars',
      pattern: ':storeId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Chrome Web Store',
        namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
        staticPreview: this.render({ rating: '3.75' }),
      },
    ]
  }

  static render({ rating }) {
    return {
      message: starRating(rating),
      color: floorCountColor(rating, 2, 3, 4),
    }
  }

  async handle({ storeId }) {
    const { ratingValue } = await this.fetch({ storeId })
    return this.constructor.render({ rating: parseFloat(ratingValue) })
  }
}

module.exports = {
  ChromeWebStoreRating,
  ChromeWebStoreRatingCount,
  ChromeWebStoreRatingStars,
}
