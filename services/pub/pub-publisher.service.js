import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  publisherId: Joi.string().allow(null).required(),
}).required()

export class PubPublisher extends BaseJsonService {
  static category = 'other'

  static route = {
    base: 'pub/publisher',
    pattern: ':packageName',
  }

  static examples = [
    {
      title: 'Pub Publisher',
      namedParams: { packageName: 'path' },
      staticPreview: this.render({ publisher: 'dart.dev' }),
      keywords: ['dart', 'dartlang'],
    },
  ]

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
