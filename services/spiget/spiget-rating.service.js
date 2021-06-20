import { starRating, metric } from '../text-formatters.js'
import { floorCount } from '../color-formatters.js'
import { BaseSpigetService, documentation, keywords } from './spiget-base.js'

export default class SpigetRatings extends BaseSpigetService {
  static category = 'rating'

  static route = {
    base: 'spiget',
    pattern: ':format(rating|stars)/:resourceId',
  }

  static examples = [
    {
      title: 'Spiget Stars',
      pattern: 'stars/:resourceId',
      namedParams: {
        resourceId: '9089',
      },
      staticPreview: this.render({
        format: 'stars',
        total: 325,
        average: 4.5,
      }),
      documentation,
    },
    {
      title: 'Spiget Rating',
      pattern: 'rating/:resourceId',
      namedParams: {
        resourceId: '9089',
      },
      staticPreview: this.render({ total: 325, average: 4.5 }),
      documentation,
      keywords,
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
    const { rating } = await this.fetch({ resourceId })
    return this.constructor.render({
      format,
      total: rating.count,
      average: rating.average.toFixed(2),
    })
  }
}
