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

  async fetchPage({ page, requestParams, schema }) {
    const { res, buffer } = await this._request(
      this.authHelper.withBearerAuthHeader({
        ...requestParams,
        ...{ options: { searchParams: { page } } },
      }),
    )

    const json = this._parseJson(buffer)
    const data = this.constructor._validate(json, schema)
    return { res, data }
  }
}
