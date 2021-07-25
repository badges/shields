import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const clojarsSchema = Joi.object({
  downloads: nonNegativeInteger,
  latest_release: Joi.string().allow(null),
  latest_version: Joi.string().required(),
}).required()

class BaseClojarsService extends BaseJsonService {
  async fetch({ clojar }) {
    // Clojars API Doc: https://github.com/clojars/clojars-web/wiki/Data
    const url = `https://clojars.org/api/artifacts/${clojar}`
    return this._requestJson({
      url,
      schema: clojarsSchema,
    })
  }
}

export { BaseClojarsService }
