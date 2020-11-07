'use strict'

const { starRating } = require('../text-formatters')
const { floorCount } = require('../color-formatters')
const OpenVSXBase = require('./open-vsx-base')

module.exports = class OpenVSXRating extends OpenVSXBase {
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
    const rating =
      ratingCount > 0
        ? `${averageRating.toFixed(1)}/5 (${ratingCount})`
        : 'UNRATED'
    const message = format === 'rating' ? rating : starRating(averageRating)
    const color =
      ratingCount > 0 ? floorCount(averageRating, 2, 3, 4) : 'lightgrey'

    return {
      message,
      color,
    }
  }

  async handle({ format, namespace, extension }) {
    const json = await this.fetch({ namespace, extension })
    const { averageRating, reviewCount } = this.validateResponse({ json })

    return this.constructor.render({
      format,
      averageRating,
      ratingCount: reviewCount,
    })
  }
}
