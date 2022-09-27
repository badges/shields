import Joi from 'joi'
import { floorCount } from '../color-formatters.js'
import { BaseJsonService } from '../index.js'

const documentation =
  '<p>A measure of how many developers use a package, providing insight into what other developers are using.</p>'

const keywords = ['dart', 'flutter']

const schema = Joi.object({
  popularityScore: Joi.number().min(0).max(1).required(),
}).required()

const title = 'Pub Popularity'

export default class PubPopularity extends BaseJsonService {
  static category = 'rating'

  static route = { base: 'pub/popularity', pattern: ':packageName' }

  static examples = [
    {
      title,
      keywords,
      documentation,
      namedParams: { packageName: 'analysis_options' },
      staticPreview: this.render({ popularityScore: 0.9 }),
    },
  ]

  static defaultBadgeData = { label: 'popularity' }

  static render({ popularityScore }) {
    const roundedScore = Math.round(popularityScore * 100)
    return {
      label: 'popularity',
      message: `${roundedScore}%`,
      color: floorCount(roundedScore, 40, 60, 80),
    }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://pub.dev/api/packages/${packageName}/score`,
    })
  }

  async handle({ packageName }) {
    const score = await this.fetch({ packageName })
    const popularityScore = score.popularityScore
    return this.constructor.render({ popularityScore })
  }
}
