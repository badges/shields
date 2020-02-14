/**
 * @module
 */

'use strict'

const Joi = require('@hapi/joi')
const jp = require('jsonpath')
const { renderDynamicBadge, errorMessages } = require('../dynamic-common')
const { InvalidParameter, InvalidResponse } = require('..')

/**
 * Dynamic service class factory which wraps {@link module:core/base-service/base~BaseService} with support of {@link https://jsonpath.com/|JSONPath}.
 *
 * @param {Function} superclass class to extend
 * @returns {Function} wrapped class
 */
module.exports = superclass =>
  class extends superclass {
    static get category() {
      return 'dynamic'
    }

    static get defaultBadgeData() {
      return {
        label: 'custom badge',
      }
    }

    /**
     * Request data from an upstream API, transform it to JSON and validate against a schema
     *
     * @param {object} attrs Refer to individual attrs
     * @param {Joi} attrs.schema Joi schema to validate the response transformed to JSON
     * @param {string} attrs.url URL to request
     * @param {object} [attrs.errorMessages={}] Key-value map of status codes
     *    and custom error messages e.g: `{ 404: 'package not found' }`.
     *    This can be used to extend or override the
     *    [default](https://github.com/badges/shields/blob/master/services/dynamic-common.js#L8)
     * @returns {object} Parsed response
     */
    async fetch({ schema, url, errorMessages }) {
      throw new Error(
        `fetch() function not implemented for ${this.constructor.name}`
      )
    }

    async handle(namedParams, { url, query: pathExpression, prefix, suffix }) {
      const data = await this.fetch({
        schema: Joi.any(),
        url,
        errorMessages,
      })

      // JSONPath only works on objects and arrays.
      // https://github.com/badges/shields/issues/4018
      if (typeof data !== 'object') {
        throw new InvalidResponse({
          prettyMessage: 'resource must contain an object or array',
        })
      }

      let values
      try {
        values = jp.query(data, pathExpression)
      } catch (e) {
        const { message } = e
        if (
          message.startsWith('Lexical error') ||
          message.startsWith('Parse error')
        ) {
          throw new InvalidParameter({
            prettyMessage: 'unparseable jsonpath query',
          })
        } else {
          throw e
        }
      }

      if (!values.length) {
        throw new InvalidResponse({ prettyMessage: 'no result' })
      }

      return renderDynamicBadge({ value: values, prefix, suffix })
    }
  }
