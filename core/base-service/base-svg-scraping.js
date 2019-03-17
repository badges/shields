'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const BaseService = require('./base')
const trace = require('./trace')
const { InvalidResponse } = require('./errors')

const defaultValueMatcher = />([^<>]+)<\/text><\/g>/
const leadingWhitespace = /(?:\r\n\s*|\r\s*|\n\s*)/g

class BaseSvgScrapingService extends BaseService {
  static valueFromSvgBadge(svg, valueMatcher = defaultValueMatcher) {
    if (typeof svg !== 'string') {
      throw new TypeError('Parameter should be a string')
    }
    const stripped = svg.replace(leadingWhitespace, '')
    const match = valueMatcher.exec(stripped)
    if (match) {
      return match[1]
    } else {
      throw new InvalidResponse({
        prettyMessage: 'unparseable svg response',
        underlyingError: Error(`Can't get value from SVG:\n${svg}`),
      })
    }
  }

  async _requestSvg({
    schema,
    valueMatcher,
    url,
    options = {},
    errorMessages = {},
  }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    const mergedOptions = {
      ...{ headers: { Accept: 'image/svg+xml' } },
      ...options,
    }
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      errorMessages,
    })
    logTrace(emojic.dart, 'Response SVG', buffer)
    const data = {
      message: this.constructor.valueFromSvgBadge(buffer, valueMatcher),
    }
    logTrace(emojic.dart, 'Response SVG (before validation)', data, {
      deep: true,
    })
    return this.constructor._validate(data, schema)
  }
}

module.exports = BaseSvgScrapingService
