import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const depsResponseSchema = Joi.object({
  schemaVersion: Joi.number().required(),
  label: Joi.string().required(),
  message: Joi.string().required(),
  color: Joi.string().required(),
}).required()

class BaseDepsRsService extends BaseJsonService {
  static defaultBadgeData = { label: 'dependencies' }

  /**
   * Fetches data from the deps.rs API.
   *
   * @param {object} options - The options for the request
   * @param {string} options.crate - The crate name.
   * @param {string} options.version - The crate version number or 'latest'.
   * @returns {Promise<object>} the JSON response from the API.
   */
  async fetchCrate({ crate, version }) {
    const url = `https://deps.rs/crate/${crate}/${version}/shield.json`
    return this._requestJson({ schema: depsResponseSchema, url })
  }

  /**
   * Fetches data from the deps.rs API for a repository.
   *
   * @param {object} options - The options for the request
   * @param {string} options.site - The repository site (e.g., 'github').
   * @param {string} options.user - The repository owner/user.
   * @param {string} options.repo - The repository name.
   * @returns {Promise<object>} the JSON response from the API.
   */
  async fetchRepo({ site, user, repo }) {
    const url = `https://deps.rs/repo/${site}/${user}/${repo}/shield.json`
    return this._requestJson({ schema: depsResponseSchema, url })
  }
}

const description =
  '[Deps.rs](https://deps.rs/) is a service that checks dependency security status in Rust projects.'

export { BaseDepsRsService, description }
