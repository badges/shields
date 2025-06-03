import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const depsResponseSchema = Joi.object({
  message: Joi.string().required(),
}).required()

class BaseDepsRsService extends BaseJsonService {
  static defaultBadgeData = { label: 'dependencies' }

  /**
   * Maps message values to shields color scheme
   *
   * @param {string} message - The message to help determine appropriate color
   * @returns {string} The shields color
   */
  static mapColor(message) {
    const normalizedMessage = message.toLowerCase()

    const colorMap = {
      'up to date': 'brightgreen',
      none: 'brightgreen',
      'maybe insecure': 'yellowgreen',
      insecure: 'red',
      unknown: 'lightgrey',
      'not found': 'lightgrey',
      invalid: 'lightgrey',
    }

    if (colorMap[normalizedMessage]) {
      return colorMap[normalizedMessage]
    }

    // e.g. "1 of 2 outdated"
    if (normalizedMessage.endsWith('outdated')) {
      return 'yellow'
    }

    return 'lightgrey'
  }

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
    return this._requestJson({
      schema: depsResponseSchema,
      url,
      httpErrors: {
        404: 'not found',
      },
    })
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
    return this._requestJson({
      schema: depsResponseSchema,
      url,
      httpErrors: {
        404: 'unknown',
      },
    })
  }
}

const description =
  '[Deps.rs](https://deps.rs/) is a service that checks dependency security status in Rust projects.'

export { BaseDepsRsService, description }
