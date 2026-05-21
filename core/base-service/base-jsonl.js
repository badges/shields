/**
 * @module
 */

import BaseService from './base.js'
import { parseJsonl } from './jsonl.js'

/**
 * Services which query a JSONL endpoint should extend BaseJsonlService
 *
 * @abstract
 */
class BaseJsonlService extends BaseService {
  /**
   * Parse data from a JSONL endpoint
   *
   * @param {string} buffer JSONL response from upstream API
   * @returns {object[]} Parsed response
   */
  _parseJsonl(buffer) {
    return parseJsonl(buffer)
  }

  static headers = {
    Accept: 'application/jsonl, application/x-ndjson, text/plain',
  }

  /**
   * Request data from an upstream API serving JSONL,
   * parse it line-by-line and validate each entry against a schema
   *
   * @param {object} attrs Refer to individual attrs
   * @param {Joi} attrs.schema Joi schema to validate each response line against
   * @param {string} attrs.url URL to request
   * @param {object} [attrs.options={}] Options to pass to got. See
   *    [documentation](https://github.com/sindresorhus/got/blob/main/documentation/2-options.md)
   * @param {object} [attrs.httpErrors={}] Key-value map of status codes
   *    and custom error messages e.g: `{ 404: 'package not found' }`.
   *    This can be used to extend or override the
   *    [default](https://github.com/badges/shields/blob/master/core/base-service/check-error-response.js#L5)
   * @param {object} [attrs.systemErrors={}] Key-value map of got network exception codes
   *    and an object of params to pass when we construct an Inaccessible exception object
   *    e.g: `{ ECONNRESET: { prettyMessage: 'connection reset' } }`.
   *    See {@link https://github.com/sindresorhus/got/blob/main/documentation/7-retry.md#errorcodes got error codes}
   *    for allowed keys
   *    and {@link module:core/base-service/errors~RuntimeErrorProps} for allowed values
   * @param {number[]} [attrs.logErrors=[429]] An array of http error codes
   *    that will be logged (to sentry, if configured).
   * @param {string} [attrs.prettyErrorMessage='invalid response data']
   *    Error message to surface when schema validation fails.
   * @returns {object[]} Parsed response
   * @see https://github.com/sindresorhus/got/blob/main/documentation/2-options.md
   */
  async _requestJsonl({
    schema,
    url,
    options = {},
    httpErrors = {},
    systemErrors = {},
    logErrors = [429],
    prettyErrorMessage = 'invalid response data',
  }) {
    const mergedOptions = {
      ...{ headers: this.constructor.headers },
      ...options,
    }
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      httpErrors,
      systemErrors,
      logErrors,
    })
    const jsonl = this._parseJsonl(buffer)

    return jsonl.map(line =>
      this.constructor._validate(line, schema, { prettyErrorMessage }),
    )
  }
}

export default BaseJsonlService
