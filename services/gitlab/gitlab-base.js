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

  async fetchPage({ page, requestParams, schema }) {
    const { res, buffer } = await this._request({
      ...requestParams,
      ...{ options: { searchParams: { page } } },
    })

    const json = this._parseJson(buffer)
    const data = this.constructor._validate(json, schema)
    return { res, data }
  }

  async fetchPaginatedArrayData({
    url,
    options,
    schema,
    errorMessages,
    firstPageOnly = false,
  }) {
    const requestParams = this.authHelper.withBasicAuth({
      url,
      options: {
        headers: { Accept: 'application/json' },
        searchParams: { per_page: 100 },
        ...options,
      },
      errorMessages,
    })

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
        this.fetchPage({ page: ++i + 1, requestParams, schema })
      )
    )
    return [...data].concat(...pageData)
  }
}
