import Joi from 'joi'
import { starRating, metric } from '../text-formatters.js'
import { colorScale } from '../color-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const pkgReviewColor = colorScale([2, 3, 4])

const schema = Joi.object({
  rating: Joi.number().min(0).max(1).precision(1).required().allow(null),
  reviewsCount: nonNegativeInteger,
}).required()

// Repository for this service is: https://github.com/iqubex-technologies/pkgreview.dev
// Internally the service leverages the npms.io API (https://api.npms.io/v2)
export default class PkgreviewRating extends BaseJsonService {
  static category = 'rating'

  static route = {
    base: 'pkgreview',
    pattern: ':format(rating|stars)/:pkgManager(npm)/:pkgSlug+',
  }

  static examples = [
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
      url: `https://pkgreview.now.sh/api/v1/${pkgManager}/${encodeURIComponent(
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
