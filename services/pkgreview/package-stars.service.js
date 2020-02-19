'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  icon: Joi.string().required(),
  starString: [Joi.string().optional(), Joi.allow(null)],
  reviewsCount: Joi.number(),
  rating: [Joi.number().optional(), Joi.allow(null)],
}).required()

module.exports = class PkgreviewStars extends BaseJsonService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'pkgreview/stars',
      pattern: ':pkgManager/:pkgSlug+',
    }
  }

  static get examples() {
    return [
      {
        title: 'pkgreview.dev Star Ratings',
        namedParams: { pkgManager: 'npm', pkgSlug: 'react' },
        staticPreview: {
          label: 'rating',
          message: '★★★★☆',
          color: '#4F78FE',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'rating',
    }
  }

  static render({ type, name, starString }) {
    return {
      message: starString || 'Be the first to review',
      color: '#4F78FE',
    }
  }

  async fetch({ pkgManager, pkgSlug }) {
    return this._requestJson({
      schema,
      url: `https://pkgreview.dev/api/v1/${pkgManager}/${encodeURIComponent(
        pkgSlug
      )}`,
      errorMessages: {
        400: 'package not found',
        408: 'response timed out',
        502: 'response timed out',
        500: 'response timed out',
      },
    })
  }

  async handle({ pkgManager, pkgSlug }) {
    const json = await this.fetch({ pkgManager, pkgSlug })
    return this.constructor.render(json)
  }
}
