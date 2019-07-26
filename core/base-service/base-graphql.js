'use strict'

const { print } = require('graphql/language/printer')
const BaseJsonService = require('./base-json')
const { InvalidResponse } = require('./errors')

function defaultGraphqlErrorHandler(errors) {
  throw new InvalidResponse({ prettyMessage: errors[0].message })
}

class BaseGraphqlService extends BaseJsonService {
  async _requestGraphql({
    schema,
    url,
    query,
    variables = {},
    options = {},
    httpErrorMessages = {},
    graphqlErrorHandler = defaultGraphqlErrorHandler,
  }) {
    const mergedOptions = {
      ...{ headers: { Accept: 'application/json' } },
      ...options,
    }
    mergedOptions.method = 'POST'
    mergedOptions.body = JSON.stringify({ query: print(query), variables })
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      errorMessages: httpErrorMessages,
    })
    const json = this._parseJson(buffer)
    if (json.errors) {
      graphqlErrorHandler(json.errors)
    }
    return this.constructor._validate(json, schema)
  }
}

module.exports = BaseGraphqlService
