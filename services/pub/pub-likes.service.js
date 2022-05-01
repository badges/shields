import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const documentation = `<p>A measure of how many developers have liked a package. This provides a raw measure of the overall sentiment of a package from peer developers.</p>`

const keywords = ['dart', 'flutter']

const schema = Joi.object({
  likeCount: Joi.number().min(0).required(),
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
      staticPreview: {
        label: 'likes',
        message: '1',
        color: 'brightgreen',
      },
    },
  ]

  static defaultBadgeData = { label: 'likes' }

  static render({ likeCount, packageName }) {
    return {
      label: 'likes',
      message: `${likeCount}`,
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
    const likeCount = score.likeCount
    return this.constructor.render({ likeCount, packageName })
  }
}
