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

  static examples = [
    {
      title: 'Visual Studio Marketplace Rating',
      pattern: 'visual-studio-marketplace/r/:extensionId',
      namedParams: { extensionId: 'ritwickdey.LiveServer' },
      staticPreview: this.render({
        format: 'r',
        averageRating: 4.79,
        ratingCount: 145,
      }),
      keywords: this.keywords,
    },
    {
      title: 'Visual Studio Marketplace Rating (Stars)',
      pattern: 'visual-studio-marketplace/stars/:extensionId',
      namedParams: { extensionId: 'ritwickdey.LiveServer' },
      staticPreview: this.render({
        format: 'stars',
        averageRating: 4.5,
      }),
      keywords: this.keywords,
    },
  ]

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
