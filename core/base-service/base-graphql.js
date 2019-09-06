/**
 * @module
 */

'use strict'

const { print } = require('graphql/language/printer')
const BaseService = require('./base')
const { InvalidResponse, ShieldsRuntimeError } = require('./errors')
const { parseJson } = require('./json')

function defaultTransformErrors(errors) {
  return new InvalidResponse({ prettyMessage: errors[0].message })
}

/**
 * Services which query a GraphQL endpoint should extend BaseGraphqlService
 *
 * @abstract
 */
class BaseGraphqlService extends BaseService {
  /**
   * Parse data from JSON endpoint
   *
   * @param {string} buffer JSON repsonse from upstream API
   * @returns {object} Parsed response
   */
  _parseJson(buffer) {
    return parseJson(buffer)
  }

  /**
   * Request data from an upstream GraphQL API,
   * parse it and validate against a schema
   *
   * @param {object} attrs Refer to individual attrs
   * @param {Joi} attrs.schema Joi schema to validate the response against
   * @param {string} attrs.url URL to request
   * @param {object} attrs.query Parsed GraphQL object
   *    representing the query clause of GraphQL POST body
   *    e.g. gql`{ query { ... } }`
   * @param {object} attrs.variables Variables clause of GraphQL POST body
   * @param {object} [attrs.options={}] Options to pass to request. See
   *    [documentation](https://github.com/request/request#requestoptions-callback)
   * @param {object} [attrs.httpErrorMessages={}] Key-value map of HTTP status codes
   *    and custom error messages e.g: `{ 404: 'package not found' }`.
   *    This can be used to extend or override the
   *    [default](https://github.com/badges/shields/blob/master/core/base-service/check-error-response.js#L5)
   * @param {Function} [attrs.transformErrors=defaultTransformErrors]
   *    Function which takes an errors object from a GraphQL
   *    response and returns an instance of ShieldsRuntimeError.
   *    The default is to return the first entry of the `errors` array as
   *    an InvalidResponse.
   * @returns {object} Parsed response
   * @see https://github.com/request/request#requestoptions-callback
   */
  async _requestGraphql({
    schema,
    url,
    query,
    variables = {},
    options = {},
    httpErrorMessages = {},
    transformErrors = defaultTransformErrors,
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
      const exception = transformErrors(json.errors)
      if (exception instanceof ShieldsRuntimeError) {
        throw exception
      } else {
        throw Error(
          `transformErrors() must return a ShieldsRuntimeError; got ${exception}`
        )
      }
    }
    return this.constructor._validate(json, schema)
  }
}

module.exports = BaseGraphqlService
