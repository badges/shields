'use strict'

const VsMarketplaceBase = require('./vs-marketplace-base')
const { starRating } = require('../../lib/text-formatters')
const { floorCount } = require('../../lib/color-formatters')

module.exports = class VsMarketplaceRating extends VsMarketplaceBase {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: '',
      pattern:
        '(vscode-marketplace|vs-marketplace)/:format(r|stars)/:extensionId',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'rating',
    }
  }

  static render({ format, averageRating, ratingCount }) {
    const message =
      format === 'r'
        ? `${averageRating}/5 (${ratingCount})`
        : starRating(averageRating)
    return {
      message,
      color: floorCount(averageRating, 2, 3, 4),
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Marketplace Rating',
        pattern: 'vs-marketplace/r/:extensionId',
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
        pattern: 'vs-marketplace/stars/:extensionId',
        namedParams: { extensionId: 'ritwickdey.LiveServer' },
        staticPreview: this.render({
          format: 'stars',
          averageRating: 4.5,
        }),
        keywords: this.keywords,
      },
    ]
  }

  async handle({ format, extensionId }) {
    const json = await this.fetch({ extensionId })
    const { statistics } = this.transformStatistics({ json })
    const { value: averageRating } = this.getStatistic({
      statistics,
      statisticName: 'averagerating',
    })

    if (format === 'stars') {
      return this.constructor.render({ format, averageRating })
    }

    const { value: ratingCount } = this.getStatistic({
      statistics,
      statisticName: 'ratingcount',
    })

    return this.constructor.render({ format, averageRating, ratingCount })
  }
}
