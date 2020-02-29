'use strict'

const Joi = require('@hapi/joi')
const { starRating, metric } = require('../text-formatters')
const { colorScale } = require('../color-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const pkgReviewColor = colorScale([2, 3, 4])

const schema = Joi.object({
  rating: Joi.number()
    .min(0)
    .max(1)
    .precision(1)
    .required()
    .allow(null),
  reviewsCount: nonNegativeInteger,
}).required()

module.exports = class PkgreviewRating extends BaseJsonService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'pkgreview',
      pattern: ':format(rating|stars)/:pkgManager(npm)/:pkgSlug+',
    }
  }

  static get examples() {
    return [
      {
        title: 'pkgreview.dev Package Ratings',
        pattern: 'rating/:pkgManager/:pkgSlug+',
        namedParams: { pkgManager: 'npm', pkgSlug: 'react' },
        staticPreview: this.render({
          format: 'rating',
          rating: 3.5,
          reviewsCount: 237,
        }),
      },
      {
        title: 'pkgreview.dev Star Ratings',
        pattern: 'stars/:pkgManager/:pkgSlug+',
        namedParams: { pkgManager: 'npm', pkgSlug: 'react' },
        staticPreview: this.render({
          format: 'stars',
          rating: 1.5,
          reviewsCount: 200,
        }),
      },
    ]
  }

  static render({ rating, reviewsCount, format }) {
    const message =
      format === 'rating'
        ? `${+parseFloat(rating).toFixed(1)}/5 (${metric(reviewsCount)})`
        : starRating(rating)

    return {
      message,
      label: format,
      color: pkgReviewColor(rating),
    }
  }

  async fetch({ pkgManager, pkgSlug }) {
    return this._requestJson({
      schema,
      url: `https://pkgreview.dev/api/v1/${pkgManager}/${encodeURIComponent(
        pkgSlug
      )}`,
      errorMessages: {
        404: 'package not found',
      },
    })
  }

  async handle({ format, pkgManager, pkgSlug }) {
    const { reviewsCount, rating } = await this.fetch({
      pkgManager,
      pkgSlug,
    })
    return this.constructor.render({
      reviewsCount,
      format,
      rating: rating * 5,
    })
  }
}
