import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { baseDescription } from './pub-common.js'

const schema = Joi.object({
  publisherId: Joi.string().allow(null).required(),
}).required()

export class PubPublisher extends BaseJsonService {
  static category = 'other'

  static route = {
    base: 'pub/publisher',
    pattern: ':packageName',
  }

  static openApi = {
    '/pub/publisher/{packageName}': {
      get: {
        summary: 'Pub Publisher',
        description: baseDescription,
        parameters: pathParams({
          name: 'packageName',
          example: 'path',
        }),
      },
    },
  }

  static _cacheLength = 3600

  static defaultBadgeData = { label: 'publisher' }

  static render({ publisher }) {
    return {
      label: 'publisher',
      message: publisher == null ? 'unverified' : publisher,
      color: publisher == null ? 'lightgrey' : 'blue',
    }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://pub.dev/api/packages/${packageName}/publisher`,
    })
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    const publisher = data.publisherId
    return this.constructor.render({ publisher })
  }
}
