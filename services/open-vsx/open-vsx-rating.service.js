import { starRating } from '../text-formatters.js'
import { floorCount } from '../color-formatters.js'
import OpenVSXBase from './open-vsx-base.js'

export default class OpenVSXRating extends OpenVSXBase {
  static category = 'rating'

  static route = {
    base: 'open-vsx',
    pattern: ':format(rating|stars)/:namespace/:extension',
  }

  static examples = [
    {
      title: 'Open VSX Rating',
      pattern: 'rating/:namespace/:extension',
      namedParams: {
        namespace: 'redhat',
        extension: 'java',
      },
      staticPreview: this.render({
        format: 'rating',
        averageRating: 5,
        ratingCount: 2,
      }),
      keywords: this.keywords,
    },
    {
      title: 'Open VSX Rating (Stars)',
      pattern: 'stars/:namespace/:extension',
      namedParams: {
        namespace: 'redhat',
        extension: 'java',
      },
      staticPreview: this.render({
        format: 'stars',
        averageRating: 5,
        ratingCount: 2,
      }),
      keywords: this.keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'rating',
  }

  static render({ format, averageRating, ratingCount }) {
    if (ratingCount === 0) {
      return {
        message: 'unrated',
        color: 'lightgrey',
      }
    }

    const message =
      format === 'rating'
        ? `${averageRating.toFixed(1)}/5 (${ratingCount})`
        : starRating(averageRating)

    return {
      message,
      color: floorCount(averageRating, 2, 3, 4),
    }
  }

  async handle({ format, namespace, extension }) {
    const { averageRating, reviewCount } = await this.fetch({
      namespace,
      extension,
    })
    return this.constructor.render({
      format,
      averageRating,
      ratingCount: reviewCount,
    })
  }
}
