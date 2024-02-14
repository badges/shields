import { floorCount as floorCountColor } from '../color-formatters.js'
import { metric, starRating } from '../text-formatters.js'
import { NotFound, pathParams } from '../index.js'
import BaseChromeWebStoreService from './chrome-web-store-base.js'

class BaseChromeWebStoreRating extends BaseChromeWebStoreService {
  static category = 'rating'

  static defaultBadgeData = { label: 'rating' }
}

class ChromeWebStoreRating extends BaseChromeWebStoreRating {
  static route = {
    base: 'chrome-web-store/rating',
    pattern: ':storeId',
  }

  static openApi = {
    '/chrome-web-store/rating/{storeId}': {
      get: {
        summary: 'Chrome Web Store Rating',
        parameters: pathParams({
          name: 'storeId',
          example: 'ogffaloegjglncjfehdfplabnoondfjo',
        }),
      },
    },
  }

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

  static openApi = {
    '/chrome-web-store/rating-count/{storeId}': {
      get: {
        summary: 'Chrome Web Store Rating Count',
        parameters: pathParams({
          name: 'storeId',
          example: 'ogffaloegjglncjfehdfplabnoondfjo',
        }),
      },
    },
  }

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

  static openApi = {
    '/chrome-web-store/stars/{storeId}': {
      get: {
        summary: 'Chrome Web Store Stars',
        parameters: pathParams({
          name: 'storeId',
          example: 'ogffaloegjglncjfehdfplabnoondfjo',
        }),
      },
    },
  }

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

export {
  ChromeWebStoreRating,
  ChromeWebStoreRatingCount,
  ChromeWebStoreRatingStars,
}
