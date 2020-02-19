'use strict'

const Joi = require('@hapi/joi')
const { starRating, metric } = require('../text-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  reviewsCount: Joi.number(),
  rating: [Joi.number().optional(), Joi.allow(null)],
}).required()

module.exports = class PkgreviewRating extends BaseJsonService {
  format = 'rating'

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
          rating: 0.845623,
          reviewsCount: 237,
        }),
      },
      {
        title: 'pkgreview.dev Star Ratings',
        pattern: 'stars/:pkgManager/:pkgSlug+',
        namedParams: { pkgManager: 'npm', pkgSlug: 'react' },
        staticPreview: this.render({
          format: 'stars',
          rating: 0.6,
          reviewsCount: 200,
        }),
      },
    ]
  }

  static render({ rating, reviewsCount, format }) {
    const message =
      format === 'rating'
        ? `${+parseFloat(rating * 5).toFixed(2)}/5 (${metric(reviewsCount)})`
        : starRating(rating * 5)

    return {
      message,
      label: format,
      color: '#4F78FE',
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
      format: this.format,
      pkgSlug: encodeURIComponent(pkgSlug),
    }
  }

  async handle({ format, pkgManager, pkgSlug }) {
    this.format = format

    const json = await this.fetch({ format: this.format, pkgManager, pkgSlug })

    const transformedJson = this.transform(json)

    return this.constructor.render(transformedJson)
  }
}
