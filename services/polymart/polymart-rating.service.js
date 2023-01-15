import { starRating, metric } from '../text-formatters.js'
import { floorCount } from '../color-formatters.js'
import { NotFound } from '../../core/base-service/errors.js'
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
        resourceId: '323',
      },
      staticPreview: this.render({
        format: 'stars',
        total: 14,
        average: 5,
      }),
      documentation,
    },
    {
      title: 'Polymart Rating',
      pattern: 'rating/:resourceId',
      namedParams: {
        resourceId: '323',
      },
      staticPreview: this.render({ total: 14, average: 5 }),
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
    if (!response.resource) {
      throw new NotFound()
    }
    return this.constructor.render({
      format,
      total: response.resource.reviews.count,
      average: response.resource.reviews.stars.toFixed(2),
    })
  }
}
