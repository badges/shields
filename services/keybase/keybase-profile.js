'use strict'

const { BaseJsonService } = require('..')

module.exports = class KeybaseProfile extends BaseJsonService {
  static get apiVersion() {
    throw new Error(`apiVersion() is not implemented for ${this.name}`)
  }

  async fetch({ schema, options }) {
    const apiVersion = this.constructor.apiVersion
    const url = `https://keybase.io/_/api/${apiVersion}/user/lookup.json`

    return this._requestJson({
      url,
      schema,
      options,
    })
  }
}
