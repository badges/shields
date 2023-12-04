import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { baseDescription } from './pub-common.js'

const description = `${baseDescription}
  <p>This badge shows a measure of how many developers have liked a package. This provides a raw measure of the overall sentiment of a package from peer developers.</p>`

const schema = Joi.object({
  likeCount: nonNegativeInteger,
}).required()

export default class PubLikes extends BaseJsonService {
  static category = 'rating'

  static route = { base: 'pub/likes', pattern: ':packageName' }

  static openApi = {
    '/pub/likes/{packageName}': {
      get: {
        summary: 'Pub Likes',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'analysis_options',
        }),
      },
    },
  }

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
