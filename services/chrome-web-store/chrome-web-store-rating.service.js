import { floorCount as floorCountColor } from '../color-formatters.js'
import { metric, starRating } from '../text-formatters.js'
import { InvalidResponse, NotFound, pathParams } from '../index.js'
import BaseChromeWebStoreService, {
  description,
} from './chrome-web-store-base.js'

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
        description,
        parameters: pathParams({
          name: 'storeId',
          example: 'ddkjiahejlhfcafbddmgiahcphecmpfh',
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
        description,
        parameters: pathParams({
          name: 'storeId',
          example: 'ddkjiahejlhfcafbddmgiahcphecmpfh',
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

  static transform(ratingCount) {
    const match = ratingCount.match(/^(\d+(?:\.\d+)?)(k)?$/i)
    if (!match) {
      throw new InvalidResponse({
        prettyMessage: 'unexpected rating count format',
      })
    }

    return Number.parseFloat(ratingCount) * (match[2] ? 1e3 : 1)
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
    return this.constructor.render({
      ratingCount: this.constructor.transform(ratingCount),
    })
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
        description,
        parameters: pathParams({
          name: 'storeId',
          example: 'ddkjiahejlhfcafbddmgiahcphecmpfh',
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
