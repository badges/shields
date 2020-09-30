'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

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

module.exports = { BaseClojarsService }
