/**
 * @module
 */

import Joi from 'joi'
import { JSONPath as jp } from 'jsonpath-plus'
import { renderDynamicBadge, httpErrors } from '../dynamic-common.js'
import { InvalidParameter, InvalidResponse } from '../index.js'

/**
 * Dynamic service class factory which wraps {@link module:core/base-service/base~BaseService} with support of {@link https://jsonpath.com/|JSONPath}.
 *
 * @param {Function} superclass class to extend
 * @returns {Function} wrapped class
 */
export default superclass =>
  class extends superclass {
    static category = 'dynamic'
    static defaultBadgeData = { label: 'custom badge' }

    /**
     * Request data from an upstream API, transform it to JSON and validate against a schema
     *
     * @param {object} attrs Refer to individual attrs
     * @param {Joi} attrs.schema Joi schema to validate the response transformed to JSON
     * @param {string} attrs.url URL to request
     * @param {object} [attrs.httpErrors={}] Key-value map of status codes
     *    and custom error messages e.g: `{ 404: 'package not found' }`.
     *    This can be used to extend or override the
     *    [default](https://github.com/badges/shields/blob/master/services/dynamic-common.js#L8)
     * @returns {object} Parsed response
     */
    async fetch({ schema, url, httpErrors }) {
      throw new Error(
        `fetch() function not implemented for ${this.constructor.name}`,
      )
    }

    async handle(namedParams, { url, query: pathExpression, prefix, suffix }) {
      const data = await this.fetch({
        schema: Joi.any(),
        url,
        httpErrors,
      })

      let values
      try {
        values = jp({ json: data, path: pathExpression, eval: false })
      } catch (e) {
        const { message } = e
        if (
          message.includes('prevented in JSONPath expression') ||
          e instanceof TypeError
        ) {
          throw new InvalidParameter({
            prettyMessage: 'query not supported',
          })
        } else {
          throw e
        }
      }

      if (!values || !values.length) {
        throw new InvalidResponse({ prettyMessage: 'no result' })
      }

      return renderDynamicBadge({ value: values, prefix, suffix })
    }
  }
