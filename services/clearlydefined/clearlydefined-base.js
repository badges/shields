import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const keywords = ['clearlydefined']

const schema = Joi.object({
  score: Joi.object({
    effective: nonNegativeInteger,
  }).required(),  
}).required()

class BaseClearlyDefinedService extends BaseJsonService {
  static defaultBadgeData = { label: 'ClearlyDefined' }

  async fetch({ type, provider, namespace, name, revision }) {
    return this._requestJson({
      schema,
      url: `https://api.clearlydefined.io/definitions//${type}/${provider}/${namespace}/${name}/${revision}`,
    })
  }
}

export { BaseClearlyDefinedService, keywords }
