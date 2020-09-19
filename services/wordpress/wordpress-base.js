'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService, NotFound } = require('..')

const stringOrFalse = Joi.alternatives(Joi.string(), Joi.bool())

const themeSchema = Joi.object()
  .keys({
    version: Joi.string(),
    rating: nonNegativeInteger,
    num_ratings: nonNegativeInteger,
    downloaded: nonNegativeInteger,
    active_installs: nonNegativeInteger,
  })
  .required()

const pluginSchema = Joi.object()
  .keys({
    version: Joi.string(),
    rating: nonNegativeInteger,
    num_ratings: nonNegativeInteger,
    downloaded: nonNegativeInteger,
    active_installs: nonNegativeInteger,
    requires: stringOrFalse,
    tested: Joi.string(),
  })
  .required()

const notFoundSchema = Joi.object()
  .keys({
    error: Joi.string(),
  })
  .required()

const pluginSchemas = Joi.alternatives(pluginSchema, notFoundSchema)
const themeSchemas = Joi.alternatives(themeSchema, notFoundSchema)

module.exports = class BaseWordpress extends BaseJsonService {
  async fetch({ extensionType, slug }) {
    const url = `https://api.wordpress.org/${extensionType}s/info/1.2/`
    let schemas
    if (extensionType === 'plugin') {
      schemas = pluginSchemas
    } else if (extensionType === 'theme') {
      schemas = themeSchemas
    }
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
              downloaded: 1,
            },
          },
        },
        qsStringifyOptions: {
          encode: false,
        },
      },
    })
    if ('error' in json) {
      throw new NotFound()
    }
    return json
  }
}
