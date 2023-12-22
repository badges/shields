import { pathParams } from '../index.js'
import { starRating } from '../text-formatters.js'
import { floorCount } from '../color-formatters.js'
import VisualStudioMarketplaceBase from './visual-studio-marketplace-base.js'

export default class VisualStudioMarketplaceRating extends VisualStudioMarketplaceBase {
  static category = 'rating'

  static route = {
    base: '',
    pattern:
      '(visual-studio-marketplace|vscode-marketplace)/:format(r|stars)/:extensionId',
  }

  static openApi = {
    '/visual-studio-marketplace/{format}/{extensionId}': {
      get: {
        summary: 'Visual Studio Marketplace Rating',
        parameters: pathParams(
          {
            name: 'format',
            example: 'r',
            description: 'rating (r) or stars',
            schema: { type: 'string', enum: this.getEnum('format') },
          },
          {
            name: 'extensionId',
            example: 'ritwickdey.LiveServer',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'rating',
  }

  static render({ format, averageRating, ratingCount }) {
    if (ratingCount < 1) {
      return {
        message: 'no ratings',
        color: 'inactive',
      }
    }

    const message =
      format === 'r'
        ? `${averageRating.toFixed(1)}/5 (${ratingCount})`
        : starRating(averageRating)
    return {
      message,
      color: floorCount(averageRating, 2, 3, 4),
    }
  }

  async handle({ format, extensionId }) {
    const json = await this.fetch({ extensionId })
    const { statistics } = this.transformStatistics({ json })
    return this.constructor.render({
      format,
      averageRating: statistics.averagerating,
      ratingCount: statistics.ratingcount,
    })
  }
}
