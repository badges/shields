import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { downloadCount } from '../color-formatters.js'
import { BaseJsonService, pathParams } from '../index.js'

const collectionSchema = Joi.object({
  payload: Joi.object({
    totalComponents: nonNegativeInteger,
  }).required(),
}).required()

export default class BitComponents extends BaseJsonService {
  static category = 'other'
  static route = {
    base: 'bit/collection/total-components',
    pattern: ':owner/:collection',
  }

  static openApi = {
    '/bit/collection/total-components/{owner}/{collection}': {
      get: {
        summary: 'Bit Components',
        parameters: pathParams(
          {
            name: 'owner',
            example: 'ramda',
          },
          {
            name: 'collection',
            example: 'ramda',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'components' }

  static render({ count }) {
    return { message: metric(count), color: downloadCount(count) }
  }

  async fetch({ owner, collection }) {
    const url = `https://api.bit.dev/scope/${owner}/${collection}/`
    return this._requestJson({
      url,
      schema: collectionSchema,
      httpErrors: {
        404: 'collection not found',
      },
    })
  }

  async handle({ owner, collection }) {
    const json = await this.fetch({ owner, collection })
    return this.constructor.render({ count: json.payload.totalComponents })
  }
}
