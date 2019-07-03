'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  version: Joi.string().required(),
  license: Joi.array()
    .items(Joi.string())
    .min(1)
    .required(),
}).required()

module.exports = class BaseCpanService extends BaseJsonService {
  static get defaultBadgeData() {
    return { label: 'cpan' }
  }

  async fetch({ packageName }) {
    const url = `https://fastapi.metacpan.org/v1/release/${packageName}`
    return this._requestJson({ schema, url })
  }
}
