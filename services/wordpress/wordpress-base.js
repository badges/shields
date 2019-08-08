'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService, NotFound } = require('..')

const foundSchema = Joi.object()
  .keys({
    version: Joi.string(),
    rating: nonNegativeInteger,
    num_ratings: nonNegativeInteger,
    downloaded: nonNegativeInteger,
    active_installs: nonNegativeInteger,
    requires: Joi.string(), // Plugin Only
    tested: Joi.string(), // Plugin Only
  })
  .required()

const notFoundSchema = Joi.string().allow(null, false)

const schemas = Joi.alternatives(foundSchema, notFoundSchema)

module.exports = class BaseWordpress extends BaseJsonService {
  async fetch({ extensionType, slug }) {
    const url = `https://api.wordpress.org/${extensionType}s/info/1.1/`
    const json = await this._requestJson({
      url,
      schema: schemas,
      options: {
        qs: {
          action: `${extensionType}_information`,
          request: {
            slug,
            fields: {
              active_installs: 1,
              sections: 0,
              homepage: 0,
              tags: 0,
              screenshot_url: 0,
            },
          },
        },
        qsStringifyOptions: {
          encode: false,
        },
      },
    })
    if (!json) {
      throw new NotFound()
    }
    return json
  }
}
