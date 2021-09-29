import { BaseJsonService } from '../index.js'

export default class GitLabBase extends BaseJsonService {
  static auth = {
    passKey: 'gitlab_token',
    serviceKey: 'gitlab',
  }

  async fetch({ url, options, schema, errorMessages }) {
    return this._requestJson(
      this.authHelper.withBasicAuth({
        schema,
        url,
        options,
        errorMessages,
      })
    )
  }
}
