'use strict'

const { floorCount: floorCountColor } = require('../color-formatters')
const { metric, starRating } = require('../text-formatters')
const { NotFound } = require('..')
const BaseChromeWebStoreService = require('./chrome-web-store-base')

class BaseChromeWebStoreRating extends BaseChromeWebStoreService {
  static category = 'rating'

  static defaultBadgeData = { label: 'rating' }
}

class ChromeWebStoreRating extends BaseChromeWebStoreRating {
  static route = {
    base: 'chrome-web-store/rating',
    pattern: ':storeId',
  }

  static examples = [
    {
      title: 'Chrome Web Store',
      namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
      staticPreview: this.render({ rating: '3.67' }),
    },
  ]

  static render({ rating }) {
    rating = Math.round(rating * 100) / 100
    return {
      message: `${rating}/5`,
      color: floorCountColor(rating, 2, 3, 4),
    }
  }

  async handle({ storeId }) {
    const chromeWebStore = await this.fetch({ storeId })
    const rating = chromeWebStore.ratingValue()
    if (rating == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return this.constructor.render({ rating })
  }
}

class ChromeWebStoreRatingCount extends BaseChromeWebStoreRating {
  static route = {
    base: 'chrome-web-store/rating-count',
    pattern: ':storeId',
  }

  static examples = [
    {
      title: 'Chrome Web Store',
      namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
      staticPreview: this.render({ ratingCount: 12 }),
    },
  ]

  static render({ ratingCount }) {
    return {
      message: `${metric(ratingCount)} total`,
      color: floorCountColor(ratingCount, 5, 50, 500),
    }
  }

  async handle({ storeId }) {
    const chromeWebStore = await this.fetch({
      storeId,
      property: 'ratingCount',
    })
    const ratingCount = chromeWebStore.ratingCount()
    if (ratingCount == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return this.constructor.render({ ratingCount })
  }
}

class ChromeWebStoreRatingStars extends BaseChromeWebStoreRating {
  static route = {
    base: 'chrome-web-store/stars',
    pattern: ':storeId',
  }

  static examples = [
    {
      title: 'Chrome Web Store',
      namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
      staticPreview: this.render({ rating: '3.75' }),
    },
  ]

  static render({ rating }) {
    return {
      message: starRating(rating),
      color: floorCountColor(rating, 2, 3, 4),
    }
  }

  async handle({ storeId }) {
    const chromeWebStore = await this.fetch({ storeId })
    const rating = chromeWebStore.ratingValue()
    if (rating == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return this.constructor.render({ rating })
  }
}

module.exports = {
  ChromeWebStoreRating,
  ChromeWebStoreRatingCount,
  ChromeWebStoreRatingStars,
}
