'use strict'

const Joi = require('@hapi/joi')
const { starRating, metric } = require('../text-formatters')
const { colorScale } = require('../color-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const pkgReviewColor = colorScale([2, 3, 4])

const schema = Joi.object({
  rating: [
    Joi.number()
      .min(1)
      .max(5)
      .optional(),
    Joi.allow(null),
  ],
  reviewsCount: nonNegativeInteger,
}).required()

module.exports = class PkgreviewRating extends BaseJsonService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'pkgreview',
      pattern: ':format(rating|stars)/:pkgManager/:pkgSlug+',
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
          rating: 0.7,
          reviewsCount: 237,
        }),
      },
      {
        title: 'pkgreview.dev Star Ratings',
        pattern: 'stars/:pkgManager/:pkgSlug+',
        namedParams: { pkgManager: 'npm', pkgSlug: 'react' },
        staticPreview: this.render({
          format: 'stars',
          rating: 0.3,
          reviewsCount: 200,
        }),
      },
    ]
  }

  static render({ rating, reviewsCount, format }) {
    const message =
      format === 'rating'
        ? `${+parseFloat(rating * 5).toFixed(1)}/5 (${metric(reviewsCount)})`
        : starRating(rating * 5)

    return {
      message,
      label: format,
      color: pkgReviewColor(rating * 5), // floorCount(rating * 5, 2, 3, 4),
    }
  }

  async fetch({ pkgManager, pkgSlug }) {
    return this._requestJson({
      schema,
      url: `https://pkgreview.dev/api/v1/${pkgManager}/${pkgSlug}`,
      errorMessages: {
        400: 'package not found',
        408: 'response timed out',
        502: 'response timed out',
        500: 'response timed out',
      },
    })
  }

  transform({ pkgSlug, ...json }) {
    return {
      ...json,
      pkgSlug: encodeURIComponent(pkgSlug),
    }
  }

  async handle({ format, pkgManager, pkgSlug }) {
    const json = await this.fetch({ pkgManager, pkgSlug })

    const transformedJson = this.transform(json)

    return this.constructor.render({ ...transformedJson, format })
  }
}
