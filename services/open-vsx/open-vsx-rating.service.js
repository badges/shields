import { pathParams } from '../index.js'
import { starRating } from '../text-formatters.js'
import { floorCount } from '../color-formatters.js'
import { OpenVSXBase, description } from './open-vsx-base.js'

export default class OpenVSXRating extends OpenVSXBase {
  static category = 'rating'

  static route = {
    base: 'open-vsx',
    pattern: ':format(rating|stars)/:namespace/:extension',
  }

  static openApi = {
    '/open-vsx/{format}/{namespace}/{extension}': {
      get: {
        summary: 'Open VSX Rating',
        description,
        parameters: pathParams(
          {
            name: 'format',
            example: 'rating',
            schema: { type: 'string', enum: this.getEnum('format') },
          },
          {
            name: 'namespace',
            example: 'redhat',
          },
          {
            name: 'extension',
            example: 'java',
          },
        ),
      },
    },
  }

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
