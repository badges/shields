'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { nonNegativeInteger } = require('../validators')

const keywords = ['Rust']

const crateSchema = Joi.object({
  crate: Joi.object({
    downloads: nonNegativeInteger,
    max_version: Joi.string().required(),
  }),
  versions: Joi.array()
    .items(
      Joi.object({
        downloads: nonNegativeInteger,
        license: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
}).required()

const versionSchema = Joi.object({
  version: Joi.object({
    downloads: nonNegativeInteger,
    num: Joi.string().required(),
    license: Joi.string().required(),
  }).required(),
}).required()

const errorSchema = Joi.object({
  errors: Joi.array()
    .items(Joi.object({ detail: Joi.string().required() }))
    .min(1)
    .required(),
}).required()

const schema = Joi.alternatives(crateSchema, versionSchema, errorSchema)

class BaseCratesService extends BaseJsonService {
  async fetch({ crate, version }) {
    const url = version
      ? `https://crates.io/api/v1/crates/${crate}/${version}`
      : `https://crates.io/api/v1/crates/${crate}`
    return this._requestJson({ schema, url })
  }

  static get defaultBadgeData() {
    return { label: 'crates.io' }
  }
}

module.exports = { BaseCratesService, keywords }
