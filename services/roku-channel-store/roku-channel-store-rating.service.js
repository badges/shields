import { floorCount as floorCountColor } from '../color-formatters.js'
import { metric, starRating } from '../text-formatters.js'
import { NotFound } from '../index.js'
import RokuChannelStoreBase from './roku-channel-store-base.js'

class BaseRokuChannelStoreRating extends RokuChannelStoreBase {
  static category = 'rating'

  static defaultBadgeData = { label: 'rating' }
}

class RokuChannelStoreRating extends BaseRokuChannelStoreRating {
  static route = {
    base: 'roku-channel-store/rating',
    pattern: ':channelId',
  }

  static examples = [
    {
      title: 'Roku Channel Store',
      namedParams: { channelId: 'cca8151de08451c477c322d5e27cea3d' },
      staticPreview: this.render({ rating: '69.8743' }),
    },
  ]

  static render({ rating }) {
    rating = Math.round((rating / 20) * 100) / 100
    return {
      message: `${rating}/5`,
      color: floorCountColor(rating, 2, 3, 4),
    }
  }

  async handle({ channelId }) {
    const channel = await this.fetch({ channelId })
    const rating = channel.rating
    if (rating == null) {
      throw new NotFound({ prettyMessage: 'Channel not found' })
    }
    return this.constructor.render({ rating })
  }
}

class RokuChannelStoreRatingCount extends BaseRokuChannelStoreRating {
  static route = {
    base: 'roku-channel-store/rating-count',
    pattern: ':channelId',
  }

  static examples = [
    {
      title: 'Roku Channel Store',
      namedParams: { channelId: 'cca8151de08451c477c322d5e27cea3d' },
      staticPreview: this.render({ starRatingCount: 20836 }),
    },
  ]

  static render({ starRatingCount }) {
    return {
      message: `${metric(starRatingCount)} total`,
      color: floorCountColor(starRatingCount, 5, 50, 500),
    }
  }

  async handle({ channelId }) {
    const channel = await this.fetch({ channelId })
    const starRatingCount = channel.starRatingCount
    if (starRatingCount == null) {
      throw new NotFound({ prettyMessage: 'Channel not found' })
    }
    return this.constructor.render({ starRatingCount })
  }
}

class RokuChannelStoreRatingStars extends BaseRokuChannelStoreRating {
  static route = {
    base: 'roku-channel-store/rating-stars',
    pattern: ':channelId',
  }

  static examples = [
    {
      title: 'Roku Channel Store',
      namedParams: { channelId: 'cca8151de08451c477c322d5e27cea3d' },
      staticPreview: this.render({ rating: '69.8743' }),
    },
  ]

  static render({ rating }) {
    rating = Math.round((rating / 20) * 100) / 100
    return {
      message: starRating(rating),
      color: floorCountColor(rating, 2, 3, 4),
    }
  }

  async handle({ channelId }) {
    const channel = await this.fetch({ channelId })
    const rating = channel.starRating
    if (rating == null) {
      throw new NotFound({ prettyMessage: 'Channel not found' })
    }
    return this.constructor.render({ rating })
  }
}

export {
  RokuChannelStoreRating,
  RokuChannelStoreRatingCount,
  RokuChannelStoreRatingStars,
}
