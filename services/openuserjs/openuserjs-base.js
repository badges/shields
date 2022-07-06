import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  UserScript: Joi.object({
    version: Joi.array().items(
      Joi.object({
        value: Joi.string().required(),
      }).required()
    ),
    license: Joi.array().items(
      Joi.object({
        value: Joi.string().required(),
      }).required()
    ),
  }).required(),
  OpenUserJS: Joi.object({
    installs: Joi.array()
      .items(
        Joi.object({
          value: nonNegativeInteger,
        }).required()
      )
      .required(),
    issues: Joi.array()
      .items(
        Joi.object({
          value: nonNegativeInteger,
        }).required()
      )
      .required(),
  }).required(),
}).required()

export default class BaseOpenUserJSService extends BaseJsonService {
  static defaultBadgeData = { label: 'openuserjs' }

  async fetch({ username, scriptname }) {
    return this._requestJson({
      schema,
      url: `https://openuserjs.org/meta/${username}/${scriptname}.meta.json`,
      errorMessages: {
        404: 'user or project not found',
        429: 'rate limited by remote server',
      },
    })
  }
}
