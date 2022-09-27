import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'

const documentation =
  '<p>A measure of how many developers have liked a package. This provides a raw measure of the overall sentiment of a package from peer developers.</p>'

const keywords = ['dart', 'flutter']

const schema = Joi.object({
  likeCount: nonNegativeInteger,
}).required()

const title = 'Pub Likes'

export default class PubLikes extends BaseJsonService {
  static category = 'rating'

  static route = { base: 'pub/likes', pattern: ':packageName' }

  static examples = [
    {
      title,
      keywords,
      documentation,
      namedParams: { packageName: 'analysis_options' },
      staticPreview: this.render({ likeCount: 1000 }),
    },
  ]

  static defaultBadgeData = { label: 'likes' }

  static render({ likeCount }) {
    return {
      label: 'likes',
      message: metric(likeCount),
      color: 'blue',
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
    const likeCount = score.likeCount
    return this.constructor.render({ likeCount })
  }
}
