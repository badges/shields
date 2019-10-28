'use strict'

const Joi = require('@hapi/joi')
const jp = require('jsonpath')
const { renderDynamicBadge, errorMessages } = require('../dynamic-common')
const { InvalidParameter, InvalidResponse } = require('..')

module.exports = superclass =>
  class extends superclass {
    async handle(namedParams, { url, query: pathExpression, prefix, suffix }) {
      const data = await this._getData({
        schema: Joi.any(),
        url,
        errorMessages,
      })

      // JSONPath only works on objects and arrays.
      // https://github.com/badges/shields/issues/4018
      if (typeof data !== 'object') {
        throw new InvalidResponse({
          prettyMessage: 'json must contain an object or array',
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
