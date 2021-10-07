import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const keywords = ['Rust']

const crateSchema = Joi.object({
  crate: Joi.object({
    downloads: nonNegativeInteger,
    recent_downloads: nonNegativeInteger.allow(null),
    max_version: Joi.string().required(),
  }).required(),
  versions: Joi.array()
    .items(
      Joi.object({
        downloads: nonNegativeInteger,
        license: Joi.string().required().allow(null),
      })
    )
    .min(1)
    .required(),
}).required()

const versionSchema = Joi.object({
  version: Joi.object({
    downloads: nonNegativeInteger,
    num: Joi.string().required(),
    license: Joi.string().required().allow(null),
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
  static defaultBadgeData = { label: 'crates.io' }

  async fetch({ crate, version }) {
    const url = version
      ? `https://crates.io/api/v1/crates/${crate}/${version}`
      : `https://crates.io/api/v1/crates/${crate}`
    return this._requestJson({ schema, url })
  }
}

export { BaseCratesService, keywords }
