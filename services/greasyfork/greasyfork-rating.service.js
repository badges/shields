import { floorCount as floorCountColor } from '../color-formatters.js'
import { metric } from '../text-formatters.js'
import BaseGreasyForkService from './greasyfork-base.js'

class BaseGreasyForkRating extends BaseGreasyForkService {
  static category = 'rating'

  static defaultBadgeData = { label: 'rating' }
}

class GreasyForkRatingCount extends BaseGreasyForkRating {
  static route = {
    base: 'greasyfork/rating-count',
    pattern: ':scriptId',
  }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ ratingCount: 22 }),
    },
  ]

  static render({ ratingCount }) {
    return {
      message: `${metric(ratingCount)} total`,
      color: floorCountColor(ratingCount, 5, 50, 500),
    }
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    return this.constructor.render({
      downloads: data.good_ratings + data.ok_ratings + data.bad_ratings,
    })
  }
}

export { GreasyForkRatingCount }
