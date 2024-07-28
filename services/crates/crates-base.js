import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, InvalidResponse } from '../index.js'

const versionSchema = Joi.object({
  downloads: nonNegativeInteger,
  // Crate size is not available for all versions.
  crate_size: nonNegativeInteger.allow(null),
  num: Joi.string().required(),
  license: Joi.string().required().allow(null),
  rust_version: Joi.string().allow(null),
})

const crateResponseSchema = Joi.object({
  crate: Joi.object({
    downloads: nonNegativeInteger,
    recent_downloads: nonNegativeInteger.allow(null),
    max_version: Joi.string().required(),
  }).required(),
  versions: Joi.array().items(versionSchema).min(1).required(),
}).required()

const versionResponseSchema = Joi.object({
  version: versionSchema.required(),
}).required()

class BaseCratesService extends BaseJsonService {
  static defaultBadgeData = { label: 'crates.io' }

  async fetch({ crate, version }) {
    const url = version
      ? `https://crates.io/api/v1/crates/${crate}/${version}`
      : `https://crates.io/api/v1/crates/${crate}?include=versions,downloads`
    const schema = version ? versionResponseSchema : crateResponseSchema
    return this._requestJson({ schema, url })
  }

  static getLatestVersion(response) {
    return response.crate.max_stable_version
      ? response.crate.max_stable_version
      : response.crate.max_version
  }

  static getVersionObj(response) {
    if (response.crate) {
      const version = this.getLatestVersion(response)
      const versionObj = response.versions.find(v => v.num === version)
      if (versionObj === undefined) {
        throw new InvalidResponse({ prettyMessage: 'version not found' })
      }
      return versionObj
    }
    return response.version
  }
}

const description =
  '[Crates.io](https://crates.io/) is a package registry for Rust.'

export { BaseCratesService, description }
