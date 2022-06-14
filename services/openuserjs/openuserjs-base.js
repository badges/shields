import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  UserScript: Joi.object({
    version: Joi.array().items(
      Joi.object({
        value: Joi.string().required(),
      })
    ),
    license: Joi.array().items(
      Joi.object({
        value: Joi.string().required(),
      })
    ),
  }).required(),
  OpenUserJS: Joi.object({
    installs: Joi.array()
      .items(
        Joi.object({
          value: nonNegativeInteger,
        })
      )
      .required(),
    issues: Joi.array()
      .items(
        Joi.object({
          value: nonNegativeInteger,
        })
      )
      .required(),
  }).required(),
}).required()

export default class BaseOpenUserJSService extends BaseJsonService {
  static defaultBadgeData = { label: 'openuserjs' }

  async fetch({ author, scriptName }) {
    return this._requestJson({
      schema,
      url: `https://openuserjs.org/meta/${author}/${scriptName}.meta.json`,
    })
  }
}
