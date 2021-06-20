/**
 * @module
 */

import { BaseJsonService } from '../index.js'

/**
 * The steam api is based like /{interface}/{method}/v{version}/
 *
 * @see https://partner.steamgames.com/doc/webapi_overview#2
 */
class BaseSteamAPI extends BaseJsonService {
  /**
   * Steam API Interface
   *
   * @see https://partner.steamgames.com/doc/webapi_overview#2
   */
  static get interf() {
    throw new Error(`interf() was not implement for ${this.name}`)
  }

  /**
   * Steam API Method
   *
   * @see https://partner.steamgames.com/doc/webapi_overview#2
   */
  static get method() {
    throw new Error(`method() was not implement for ${this.name}`)
  }

  /**
   * Steam API Version
   *
   * @see https://partner.steamgames.com/doc/webapi_overview#2
   */
  static get version() {
    throw new Error(`version() was not implement for ${this.name}`)
  }

  async fetch({ schema, options }) {
    const interf = this.constructor.interf
    const method = this.constructor.method
    const version = this.constructor.version
    const url = `https://api.steampowered.com/${interf}/${method}/v${version}/?format=json`
    return this._requestJson({
      url,
      schema,
      errorMessages: {
        400: 'bad request',
      },
      options,
    })
  }
}

export default BaseSteamAPI
