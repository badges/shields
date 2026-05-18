import { floorCount as floorCountColor } from '../color-formatters.js'
import { metric, starRating } from '../text-formatters.js'
import { NotFound, pathParams } from '../index.js'
import BaseEdgeAddOnsService, { description } from './edge-add-ons-base.js'

class BaseEdgeAddOnsRating extends BaseEdgeAddOnsService {
  static category = 'rating'

  static defaultBadgeData = { label: 'rating' }
}

class EdgeAddOnsRating extends BaseEdgeAddOnsRating {
  static route = {
    base: 'edge-add-ons/rating',
    pattern: ':storeId',
  }

  static openApi = {
    '/edge-add-ons/rating/{storeId}': {
      get: {
        summary: 'Microsoft Edge Add-ons Rating',
        description,
        parameters: pathParams({
          name: 'storeId',
          example: 'cnlefmmeadmemmdciolhbnfeacpdfbkd',
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
    const edgeAddOns = await this.fetch({ storeId })
    const rating = edgeAddOns.averageRating()
    if (rating == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return this.constructor.render({ rating })
  }
}

class EdgeAddOnsRatingCount extends BaseEdgeAddOnsRating {
  static route = {
    base: 'edge-add-ons/rating-count',
    pattern: ':storeId',
  }

  static openApi = {
    '/edge-add-ons/rating-count/{storeId}': {
      get: {
        summary: 'Microsoft Edge Add-ons Rating Count',
        description,
        parameters: pathParams({
          name: 'storeId',
          example: 'cnlefmmeadmemmdciolhbnfeacpdfbkd',
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
    const edgeAddOns = await this.fetch({ storeId })
    const ratingCount = edgeAddOns.ratingCount()
    if (ratingCount == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return this.constructor.render({ ratingCount })
  }
}

class EdgeAddOnsRatingStars extends BaseEdgeAddOnsRating {
  static route = {
    base: 'edge-add-ons/stars',
    pattern: ':storeId',
  }

  static openApi = {
    '/edge-add-ons/stars/{storeId}': {
      get: {
        summary: 'Microsoft Edge Add-ons Stars',
        description,
        parameters: pathParams({
          name: 'storeId',
          example: 'cnlefmmeadmemmdciolhbnfeacpdfbkd',
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
    const edgeAddOns = await this.fetch({ storeId })
    const rating = edgeAddOns.averageRating()
    if (rating == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return this.constructor.render({ rating })
  }
}

export { EdgeAddOnsRating, EdgeAddOnsRatingCount, EdgeAddOnsRatingStars }
