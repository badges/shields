import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const documentation = `<p>A measure of how many developers use a package, providing insight into what other developers are using.</p>`

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
      staticPreview: {
        label: 'popularity',
        message: '100%',
        color: 'brightgreen',
      },
    },
  ]

  static defaultBadgeData = { label: 'popularity' }

  static render({ popularityScore, packageName }) {
    return {
      label: 'popularity',
      message: `${Math.round(popularityScore * 100)}%`,
      color: 'brightgreen',
      link: `https://pub.dev/packages/${packageName}`,
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
    return this.constructor.render({ popularityScore, packageName })
  }
}
