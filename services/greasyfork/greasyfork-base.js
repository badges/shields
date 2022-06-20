import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

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
    return this._requestJson({
      schema,
      url: `https://greasyfork.org/scripts/${scriptId}.json`,
    })
  }
}
