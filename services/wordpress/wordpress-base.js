'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService, NotFound } = require('..')

const stringOrFalse = Joi.alternatives(Joi.string(), Joi.bool())

const themeSchema = Joi.object()
  .keys({
    version: Joi.string().required(),
    rating: nonNegativeInteger,
    num_ratings: nonNegativeInteger,
    downloaded: nonNegativeInteger,
    active_installs: nonNegativeInteger,
    author: Joi.object()
      .keys({
        user_nicename: Joi.string(),
        profile: Joi.string().required(),
        avatar: Joi.string(),
        display_name: Joi.string().required(),
      })
      .required(),
  })
  .required()

const pluginContributor = Joi.object()
  .keys({
    profile: Joi.string().required(),
    avatar: Joi.string(),
    display_name: Joi.string().required(),
  })
  .required()

const pluginSchema = Joi.object()
  .keys({
    version: Joi.string().required(),
    rating: nonNegativeInteger,
    num_ratings: nonNegativeInteger,
    downloaded: nonNegativeInteger,
    active_installs: nonNegativeInteger,
    requires: stringOrFalse.required(),
    tested: Joi.string().required(),
    author: Joi.string().required(),
    author_profile: Joi.string().required(),
    contributors: Joi.object().pattern(/^/, pluginContributor).required(),
  })
  .required()

const notFoundSchema = Joi.object()
  .keys({
    error: Joi.string().required(),
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
