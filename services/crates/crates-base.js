import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, InvalidParameter } from '../index.js'

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
      }),
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
      : `https://crates.io/api/v1/crates/${crate}?include=versions,downloads`
    return this._requestJson({ schema, url })
  }

  /** get the default version for a crate using the same logic as crates.io
   * this should be kept in sync with the crates.io implementation in
   * https://github.com/rust-lang/crates.io/blob/20bbac9f5521cb4888ef63f8464fddb28fd973f5/app/models/crate.js#L34-L41
   *
   * @param {object} crate the `json.crate` response from crates.io
   * @returns {string} the default version string, or throws an error
   */
  static defaultVersion(crate) {
    if (crate) {
      if (crate.max_stable_version) {
        return crate.max_stable_version
      }
      if (crate.max_version && crate.max_version !== '0.0.0') {
        return crate.max_version
      }
    }
    throw new InvalidParameter({
      prettyMessage:
        'default version not found, possibly all versions were yanked',
    })
  }

  /** get the default version object from the `json.versions` array.
   *
   * @param {object} crate the `json.crate` response from crates.io
   * @param {object[]} versions the `json.versions` response from crates.io
   * @returns {object} the default version object, or throws an error if not found
   */
  static defaultVersionObject(crate, versions) {
    const lastVerNum = BaseCratesService.defaultVersion(crate)
    const version = versions.find(ver => ver.num === lastVerNum)
    if (!version) {
      throw new InvalidParameter({
        prettyMessage: 'version object not found in the versions array',
      })
    }
    return version
  }
}

export { BaseCratesService, keywords }
