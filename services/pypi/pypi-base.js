import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  info: Joi.object({
    version: Joi.string().required(),
    // https://github.com/badges/shields/issues/2022
    // https://github.com/badges/shields/issues/7728
    license: Joi.string().allow('').allow(null),
    classifiers: Joi.array().items(Joi.string()).required(),
  }).required(),
  urls: Joi.array()
    .items(
      Joi.object({
        packagetype: Joi.string().required(),
      }),
    )
    .required(),
}).required()

export default class PypiBase extends BaseJsonService {
  static buildRoute(base) {
    return {
      base,
      pattern: ':egg+',
    }
  }

  async fetch({ egg }) {
    return this._requestJson({
      schema,
      url: `https://pypi.org/pypi/${egg}/json`,
      httpErrors: { 404: 'package or version not found' },
    })
  }
}
