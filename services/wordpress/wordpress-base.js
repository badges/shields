'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')
const { nonNegativeInteger } = require('../validators')

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
  static get extensionType() {
    throw new Error(`extensionType() function not implemented for ${this.name}`)
  }

  async fetch({ slug }) {
    const url = `https://api.wordpress.org/${
      this.constructor.extensionType
    }s/info/1.1/`
    return this._requestJson({
      url,
      schema: schemas,
      options: {
        qs: {
          action: `${this.constructor.extensionType}_information`,
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
  }

  async handle({ slug }) {
    const json = await this.fetch({ slug })

    if (!json) {
      throw new NotFound()
    }

    return this.constructor.render({ response: json })
  }
}
