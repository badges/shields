import { pathParams } from '../index.js'
import { starRating, metric } from '../text-formatters.js'
import { floorCount } from '../color-formatters.js'
import { BaseSpigetService, description } from './spiget-base.js'

export default class SpigetRatings extends BaseSpigetService {
  static category = 'rating'

  static route = {
    base: 'spiget',
    pattern: ':format(rating|stars)/:resourceId',
  }

  static openApi = {
    '/spiget/{format}/{resourceId}': {
      get: {
        summary: 'Spiget Rating',
        description,
        parameters: pathParams(
          {
            name: 'format',
            example: 'rating',
            schema: { type: 'string', enum: this.getEnum('format') },
          },
          {
            name: 'resourceId',
            example: '9089',
          },
        ),
      },
    },
  }

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
    const { rating } = await this.fetch({ resourceId })
    return this.constructor.render({
      format,
      total: rating.count,
      average: rating.average.toFixed(2),
    })
  }
}
