import { BaseJsonService } from '../index.js'

export default class GitLabBase extends BaseJsonService {
  static auth = {
    passKey: 'gitlab_token',
    serviceKey: 'gitlab',
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

  async fetchPaginatedArrayData({
    url,
    options,
    schema,
    httpErrors,
    firstPageOnly = false,
  }) {
    const requestParams = {
      url,
      options: {
        headers: { Accept: 'application/json' },
        searchParams: { per_page: 100 },
        ...options,
      },
      httpErrors,
    }

    const {
      res: { headers },
      data,
    } = await this.fetchPage({ page: 1, requestParams, schema })
    const numberOfPages = headers['x-total-pages']

    if (numberOfPages === 1 || firstPageOnly) {
      return data
    }

    const pageData = await Promise.all(
      [...Array(numberOfPages - 1).keys()].map((_, i) =>
        this.fetchPage({ page: ++i + 1, requestParams, schema }),
      ),
    )
    return [...data].concat(...pageData)
  }
}
