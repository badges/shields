/**
 * @module
 */

import emojic from 'emojic'
import { parse } from 'smol-toml'
import BaseService from './base.js'
import { InvalidResponse } from './errors.js'
import trace from './trace.js'

/**
 * Services which query a TOML endpoint should extend BaseTomlService
 *
 * @abstract
 */
class BaseTomlService extends BaseService {
  /**
   * Request data from an upstream API serving TOML,
   * parse it and validate against a schema
   *
   * @param {object} attrs Refer to individual attrs
   * @param {Joi} attrs.schema Joi schema to validate the response against
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
   * @returns {object} Parsed response
   * @see https://github.com/sindresorhus/got/blob/main/documentation/2-options.md
   */
  async _requestToml({
    schema,
    url,
    options = {},
    httpErrors = {},
    systemErrors = {},
    logErrors = [429],
  }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    const mergedOptions = {
      ...{
        headers: {
          Accept:
            // the official header should be application/toml - see https://toml.io/en/v1.0.0#mime-type
            // but as this is not registered here https://www.iana.org/assignments/media-types/media-types.xhtml
            // some apps use other mime-type like application/x-toml, text/plain etc....
            'text/x-toml, text/toml, application/x-toml, application/toml, text/plain',
        },
      },
      ...options,
    }
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      httpErrors,
      systemErrors,
      logErrors,
    })
    let parsed
    try {
      parsed = parse(buffer.toString())
    } catch (err) {
      logTrace(emojic.dart, 'Response TOML (unparseable)', buffer)
      throw new InvalidResponse({
        prettyMessage: 'unparseable toml response',
        underlyingError: err,
      })
    }
    logTrace(emojic.dart, 'Response TOML (before validation)', parsed, {
      deep: true,
    })
    return this.constructor._validate(parsed, schema)
  }
}

export default BaseTomlService
