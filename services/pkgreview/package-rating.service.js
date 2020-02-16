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

module.exports = class PkgreviewRating extends BaseJsonService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'pkgreview/rating',
      pattern: ':pkgManager/:pkgSlug+',
    }
  }

  static get examples() {
    return [
      {
        title: 'pkgreview.dev Package Ratings',
        namedParams: { pkgManager: 'npm', pkgSlug: 'react' },
        staticPreview: {
          label: 'pkgreview.dev',
          message: '4/5 (125)',
          color: '#4F78FE',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'pkgreview.dev',
      color: '#4F78FE',
    }
  }

  static render({ type, name, rating, reviewsCount }) {
    return {
      label: `pkgreview.dev`,
      message: rating
        ? `${rating * 5}/5 (${reviewsCount})`
        : 'Be the first to review',
      color: '#4F78FE',
      link: [
        `https://pkgreview.dev/${type}/${encodeURIComponent(name).replace(
          '%40',
          '@'
        )}`,
      ],
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
      },
    })
  }

  async handle({ pkgManager, pkgSlug }) {
    const json = await this.fetch({ pkgManager, pkgSlug })
    return this.constructor.render(json)
  }
}
