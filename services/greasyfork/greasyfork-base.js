import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound } from '../index.js'

const schema = Joi.object({
  daily_installs: nonNegativeInteger,
  total_installs: nonNegativeInteger,
  good_ratings: nonNegativeInteger,
  ok_ratings: nonNegativeInteger,
  bad_ratings: nonNegativeInteger,
  version: Joi.string().required(),
  license: Joi.string().allow(null).required(),
}).required()

export default class BaseGreasyForkService extends BaseJsonService {
  static defaultBadgeData = { label: 'greasy fork' }

  async fetch({ scriptId }) {
    try {
      return await this._requestJson({
        schema,
        url: `https://greasyfork.org/scripts/${scriptId}.json`,
      })
    } catch (e) {
      if (!(e instanceof NotFound)) throw e
      return this._requestJson({
        schema,
        url: `https://sleazyfork.org/scripts/${scriptId}.json`,
      })
    }
  }
}
