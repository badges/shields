import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  version: Joi.string().required(),
  // https://github.com/badges/shields/issues/4688
  license: Joi.alternatives(
    Joi.string().required(),
    Joi.object({
      type: Joi.string().required(),
    }).required()
  ),
  // https://github.com/badges/shields/pull/209
  platforms: Joi.object().default({ ios: '5.0', osx: '10.7' }),
}).required()

export default class BaseCocoaPodsService extends BaseJsonService {
  async fetch({ spec }) {
    return this._requestJson({
      schema,
      url: `https://trunk.cocoapods.org/api/v1/pods/${spec}/specs/latest`,
    })
  }
}
