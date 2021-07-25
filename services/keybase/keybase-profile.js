import { BaseJsonService, NotFound } from '../index.js'

export default class KeybaseProfile extends BaseJsonService {
  static get apiVersion() {
    throw new Error(`apiVersion() is not implemented for ${this.name}`)
  }

  static category = 'social'

  async fetch({ schema, options }) {
    const apiVersion = this.constructor.apiVersion
    // See https://keybase.io/docs/api/1.0/call/user/lookup.
    const url = `https://keybase.io/_/api/${apiVersion}/user/lookup.json`

    return this._requestJson({
      url,
      schema,
      options,
    })
  }

  transform({ data }) {
    if (data.status.code !== 0) {
      throw new NotFound({ prettyMessage: 'invalid username' })
    }

    if (data.them.length === 0 || !data.them[0]) {
      throw new NotFound({ prettyMessage: 'profile not found' })
    }

    return { user: data.them[0] }
  }
}
