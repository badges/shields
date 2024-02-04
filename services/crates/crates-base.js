import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound } from '../index.js'

const versionSchema = Joi.object({
  downloads: nonNegativeInteger,
  num: Joi.string().required(),
  license: Joi.string().required().allow(null),
  rust_version: Joi.string().allow(null),
}).required()

const crateResponseSchema = Joi.object({
  crate: Joi.object({
    downloads: nonNegativeInteger,
    recent_downloads: nonNegativeInteger.allow(null),
    max_version: Joi.string().required(),
  }).required(),

  versions: Joi.array().items(versionSchema).min(1).required(),
}).required()

const versionResponseSchema = Joi.object({
  version: versionSchema,
}).required()

const scresponseSema = Joi.alternatives(
  crateResponseSchema,
  versionResponseSchema,
)

class BaseCratesService extends BaseJsonService {
  static defaultBadgeData = { label: 'crates.io' }

  async fetch({ crate, version }) {
    const url = version
      ? `https://crates.io/api/v1/crates/${crate}/${version}`
      : `https://crates.io/api/v1/crates/${crate}?include=versions,downloads`
    return this._requestJson({ schema: scresponseSema, url })
  }
}

// Note: in contrast to just picking version [0], this still works when the newest version was yanked.
export function getVersionInfoOrUndefined(response) {
  if (response.crate) {
    const maxVersion = response.crate.max_version
    return response.crate.versions.find(version => version.num === maxVersion)
  } else if (response.version) {
    return response.version
  } else return undefined
}

const description =
  '[Crates.io](https://crates.io/) is a package registry for Rust.'

export { BaseCratesService, description }
