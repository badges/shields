'use strict'

const { parse } = require('graphql')
const BaseJsonService = require('./base-json')
const { InvalidResponse } = require('./errors')

function defaultGraphqlErrorHandler(errors) {
  throw new InvalidResponse({ prettyMessage: errors[0].message })
}

class BaseGraphqlService extends BaseJsonService {
  _validateQuery(query) {
    // Attempting to parse the query string
    // will throw a descriptive exception if it isn't valid
    parse(query)
  }

  async _requestGraphql({
    schema,
    url,
    query,
    variables = {},
    options = {},
    httpErrorMessages = {},
    graphqlErrorHandler = defaultGraphqlErrorHandler,
  }) {
    this._validateQuery(query)

    const mergedOptions = {
      ...{ headers: { Accept: 'application/json' } },
      ...options,
    }
    mergedOptions.method = 'POST'
    mergedOptions.body = JSON.stringify({ query, variables })
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
