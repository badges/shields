import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, InvalidResponse } from '../index.js'

const versionSchema = Joi.object({
  downloads: nonNegativeInteger,
  crate_size: nonNegativeInteger,
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

const userStatsSchema = Joi.object({
  total_downloads: nonNegativeInteger.required(),
}).required()

class BaseCratesService extends BaseJsonService {
  static defaultBadgeData = { label: 'crates.io' }

  /**
   * Fetches data from the crates.io API.
   *
   * @param {object} options - The options for the request
   * @param {string} options.crate - The crate name.
   * @param {string} [options.version] - The crate version number (optional).
   * @returns {Promise<object>} the JSON response from the API.
   */
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

class BaseCratesUserService extends BaseJsonService {
  static defaultBadgeData = { label: 'crates.io' }

  /**
   * Fetches data from the crates.io API.
   *
   * @param {object} options - The options for the request
   * @param {string} options.userId - The user ID.
   * @returns {Promise<object>} the JSON response from the API.
   */
  async fetch({ userId }) {
    const url = `https://crates.io/api/v1/users/${userId}/stats`
    return this._requestJson({ schema: userStatsSchema, url })
  }
}

const description =
  '[Crates.io](https://crates.io/) is a package registry for Rust.'

export { BaseCratesService, BaseCratesUserService, description }
