import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  rating: Joi.number().min(0),
  starRating: Joi.number().min(0),
  starRatingCount: nonNegativeInteger,
}).required()

export default class RokuChannelStoreBase extends BaseJsonService {
  static category = 'build'

  async fetch({ channelId }) {
    const url = `https://channelstore.roku.com/api/v6/channels/${channelId}`
    return this._requestJson({
      schema,
      url,
      errorMessages: { 404: 'Channel not found or access denied' },
    })
  }

  static buildRoute(base) {
    return {
      base,
      pattern: ':channel*',
    }
  }
}
