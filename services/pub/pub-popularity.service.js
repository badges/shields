import Joi from 'joi'
import { floorCount } from '../color-formatters.js'
import { BaseJsonService, pathParams } from '../index.js'
import { baseDescription } from './pub-common.js'

const description = `${baseDescription}
  <p>This badge shows a measure of how many developers use a package, providing insight into what other developers are using.</p>`

const schema = Joi.object({
  popularityScore: Joi.number().min(0).max(1).required(),
}).required()

export default class PubPopularity extends BaseJsonService {
  static category = 'rating'

  static route = { base: 'pub/popularity', pattern: ':packageName' }

  static openApi = {
    '/pub/popularity/{packageName}': {
      get: {
        summary: 'Pub Popularity',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'analysis_options',
        }),
      },
    },
  }

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
