import { BaseJsonService } from '../index.js'

export default class GiteaBase extends BaseJsonService {
  static auth = {
    passKey: 'gitea_token',
    serviceKey: 'gitea',
  }

  async fetch({ url, options, schema, httpErrors }) {
    return this._requestJson(
      this.authHelper.withBearerAuthHeader({
        schema,
        url,
        options,
        httpErrors,
      }),
    )
  }
}
