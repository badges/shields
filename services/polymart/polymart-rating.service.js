import { starRating, metric } from '../text-formatters.js'
import { floorCount } from '../color-formatters.js'
import { BasePolymartService, documentation } from './polymart-base.js'

export default class PolymartRatings extends BasePolymartService {
  static category = 'rating'

  static route = {
    base: 'polymart',
    pattern: ':format(rating|stars)/:resourceId',
  }

  static examples = [
    {
      title: 'Polymart Stars',
      pattern: 'stars/:resourceId',
      namedParams: {
        resourceId: '1620',
      },
      staticPreview: this.render({
        format: 'stars',
        total: 14,
        average: 4.8,
      }),
      documentation,
    },
    {
      title: 'Polymart Rating',
      pattern: 'rating/:resourceId',
      namedParams: {
        resourceId: '1620',
      },
      staticPreview: this.render({ total: 14, average: 4.8 }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'rating',
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

  async handle({ format, resourceId }) {
    const { response } = await this.fetch({ resourceId })
    return this.constructor.render({
      format,
      total: response.resource.reviews.count,
      average: response.resource.reviews.stars.toFixed(2),
    })
  }
}
