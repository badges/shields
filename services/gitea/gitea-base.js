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
    const {
      options: { searchParams: existingQuery, ...restOptions } = {},
      ...rest
    } = requestParams

    requestParams = {
      options: {
        searchParams: {
          ...existingQuery,
          ...{ page },
        },
        ...restOptions,
      },
      ...rest,
    }

    const { res, buffer } = await this._request(
      this.authHelper.withBearerAuthHeader({
        ...requestParams,
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
    const requestLimit = 100
    const requestParams = {
      url,
      options: {
        headers: { Accept: 'application/json' },
        searchParams: { limit: requestLimit },
        ...options,
      },
      httpErrors,
    }

    const {
      res: { headers },
      data,
    } = await this.fetchPage({ page: 1, requestParams, schema })
    const numberOfItems = headers['x-total-count']

    let numberOfPages = 1
    if (numberOfItems > 0) {
      numberOfPages = Math.ceil(numberOfItems / requestLimit)
    }

    if (numberOfPages === 1 || firstPageOnly) {
      return data
    }

    const pageData = await Promise.all(
      [...Array(numberOfPages - 1).keys()].map((_, i) =>
        this.fetchPage({ page: ++i + 1, requestParams, schema }),
      ),
    )

    return [...data].concat(...pageData.map(p => p.data))
  }
}
