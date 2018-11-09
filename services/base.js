'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const Joi = require('joi')
const queryString = require('query-string')
const pathToRegexp = require('path-to-regexp')
const {
  NotFound,
  InvalidResponse,
  Inaccessible,
  InvalidParameter,
  Deprecated,
} = require('./errors')
const { checkErrorResponse } = require('../lib/error-helper')
const {
  makeLogo,
  toArray,
  makeColor,
  setBadgeColor,
} = require('../lib/badge-data')
const { staticBadgeUrl } = require('../lib/make-badge-url')
const trace = require('./trace')

class BaseService {
  constructor({ sendAndCacheRequest }, { handleInternalErrors }) {
    this._sendAndCacheRequest = sendAndCacheRequest
    this._handleInternalErrors = handleInternalErrors
  }

  static render(props) {
    throw new Error(`render() function not implemented for ${this.name}`)
  }

  /**
   * Asynchronous function to handle requests for this service. Take the route
   * parameters (as defined in the `route` property), perform a request using
   * `this._sendAndCacheRequest`, and return the badge data.
   */
  async handle(namedParams, queryParams) {
    throw new Error(`Handler not implemented for ${this.constructor.name}`)
  }

  // Metadata

  /**
   * Name of the category to sort this badge into (eg. "build"). Used to sort
   * the badges on the main shields.io website.
   */
  static get category() {
    return 'unknown'
  }

  /**
   * Returns an object:
   *  - base: (Optional) The base path of the routes for this service. This is
   *    used as a prefix.
   *  - format: Regular expression to use for routes for this service's badges
   *  - capture: Array of names for the capture groups in the regular
   *             expression. The handler will be passed an object containing
   *             the matches.
   *  - queryParams: Array of names for query parameters which will the service
   *                 uses. For cache safety, only the whitelisted query
   *                 parameters will be passed to the handler.
   */
  static get route() {
    throw new Error(`Route not defined for ${this.name}`)
  }

  /**
   * Default data for the badge. Can include things such as default logo, color,
   * etc. These defaults will be used if the value is not explicitly overridden
   * by either the handler or by the user via query parameters.
   */
  static get defaultBadgeData() {
    return {}
  }

  /**
   * Example URLs for this service. These should use the format
   * specified in `route`, and can be used to demonstrate how to use badges for
   * this service.
   */
  static get examples() {
    return []
  }

  static _makeFullUrl(partialUrl) {
    return `/${[this.route.base, partialUrl].filter(Boolean).join('/')}`
  }

  static _makeStaticExampleUrl(serviceData) {
    const badgeData = this._makeBadgeData({}, serviceData)
    return staticBadgeUrl({
      label: badgeData.text[0],
      message: `${badgeData.text[1]}`,
      color: badgeData.colorscheme || badgeData.colorB,
    })
  }

  static _dotSvg(url) {
    if (url.includes('?')) {
      return url.replace('?', '.svg?')
    } else {
      return `${url}.svg`
    }
  }

  /**
   * Return an array of examples. Each example is prepared according to the
   * schema in `lib/all-badge-examples.js`.
   */
  static prepareExamples() {
    return this.examples.map(
      (
        {
          title,
          query,
          exampleUrl,
          previewUrl,
          urlPattern,
          staticExample,
          documentation,
          keywords,
        },
        index
      ) => {
        if (staticExample) {
          if (!urlPattern) {
            throw new Error(
              `Static example for ${
                this.name
              } at index ${index} does not declare a urlPattern`
            )
          }
          if (!exampleUrl) {
            throw new Error(
              `Static example for ${
                this.name
              } at index ${index} does not declare an exampleUrl`
            )
          }
          if (previewUrl) {
            throw new Error(
              `Static example for ${
                this.name
              } at index ${index} also declares a dynamic previewUrl, which is not allowed`
            )
          }
        } else if (!previewUrl) {
          throw Error(
            `Example for ${
              this.name
            } at index ${index} is missing required previewUrl or staticExample`
          )
        }

        const stringified = queryString.stringify(query)
        const suffix = stringified ? `?${stringified}` : ''

        return {
          title: title ? `${title}` : this.name,
          exampleUrl: exampleUrl
            ? `${this._dotSvg(this._makeFullUrl(exampleUrl))}${suffix}`
            : undefined,
          previewUrl: staticExample
            ? this._makeStaticExampleUrl(staticExample)
            : `${this._dotSvg(this._makeFullUrl(previewUrl))}${suffix}`,
          urlPattern: urlPattern
            ? `${this._dotSvg(this._makeFullUrl(urlPattern))}${suffix}`
            : undefined,
          documentation,
          keywords,
        }
      }
    )
  }

  static get _regexFromPath() {
    const { pattern } = this.route
    const fullPattern = `${this._makeFullUrl(
      pattern
    )}.:ext(svg|png|gif|jpg|json)`

    const keys = []
    const regex = pathToRegexp(fullPattern, keys, {
      strict: true,
      sensitive: true,
    })
    const capture = keys.map(item => item.name).slice(0, -1)

    return { regex, capture }
  }

  static get _regex() {
    const { pattern, format, capture } = this.route
    if (
      pattern !== undefined &&
      (format !== undefined || capture !== undefined)
    ) {
      throw Error(
        `Since the route for ${
          this.name
        } includes a pattern, it should not include a format or capture`
      )
    } else if (pattern !== undefined) {
      return this._regexFromPath.regex
    } else if (format !== undefined) {
      // Regular expressions treat "/" specially, so we need to escape them
      const escapedPath = this.route.format.replace(/\//g, '\\/')
      const fullRegex = `^${this._makeFullUrl(
        escapedPath
      )}.(svg|png|gif|jpg|json)$`
      return new RegExp(fullRegex)
    } else {
      throw Error(`The route for ${this.name} has neither pattern nor format`)
    }
  }

  static get _cacheLength() {
    const cacheLengths = {
      build: 30,
      license: 3600,
      version: 300,
    }
    return cacheLengths[this.category]
  }

  static _namedParamsForMatch(match) {
    const { pattern, capture } = this.route
    const names = pattern ? this._regexFromPath.capture : capture || []

    // Assume the last match is the format, and drop match[0], which is the
    // entire match.
    const captures = match.slice(1, -1)

    if (names.length !== captures.length) {
      throw new Error(
        `Service ${this.name} declares incorrect number of capture groups ` +
          `(expected ${names.length}, got ${captures.length})`
      )
    }

    const result = {}
    names.forEach((name, index) => {
      result[name] = captures[index]
    })
    return result
  }

  async invokeHandler(namedParams, queryParams) {
    trace.logTrace(
      'inbound',
      emojic.womanCook,
      'Service class',
      this.constructor.name
    )
    trace.logTrace('inbound', emojic.ticket, 'Named params', namedParams)
    trace.logTrace('inbound', emojic.crayon, 'Query params', queryParams)
    try {
      return await this.handle(namedParams, queryParams)
    } catch (error) {
      if (error instanceof NotFound || error instanceof InvalidParameter) {
        trace.logTrace('outbound', emojic.noGoodWoman, 'Handled error', error)
        return {
          message: error.prettyMessage,
          color: 'red',
        }
      } else if (
        error instanceof InvalidResponse ||
        error instanceof Inaccessible ||
        error instanceof Deprecated
      ) {
        trace.logTrace('outbound', emojic.noGoodWoman, 'Handled error', error)
        return {
          message: error.prettyMessage,
          color: 'lightgray',
        }
      } else if (this._handleInternalErrors) {
        if (
          !trace.logTrace(
            'unhandledError',
            emojic.boom,
            'Unhandled internal error',
            error
          )
        ) {
          // This is where we end up if an unhandled exception is thrown in
          // production. Send the error to the logs.
          console.log(error)
        }
        return {
          label: 'shields',
          message: 'internal error',
          color: 'lightgray',
        }
      } else {
        trace.logTrace(
          'unhandledError',
          emojic.boom,
          'Unhandled internal error',
          error
        )
        throw error
      }
    }
  }

  static _makeBadgeData(overrides, serviceData) {
    const {
      style,
      label: overrideLabel,
      logo: overrideLogo,
      logoColor: overrideLogoColor,
      logoWidth: overrideLogoWidth,
      link: overrideLink,
      colorA: overrideColorA,
      colorB: overrideColorB,
    } = overrides

    const {
      label: serviceLabel,
      message: serviceMessage,
      color: serviceColor,
      link: serviceLink,
    } = serviceData

    const {
      color: defaultColor,
      logo: defaultLogo,
      label: defaultLabel,
    } = this.defaultBadgeData

    const badgeData = {
      text: [
        overrideLabel || serviceLabel || defaultLabel || this.category,
        serviceMessage || 'n/a',
      ],
      template: style,
      logo: makeLogo(style === 'social' ? defaultLogo : undefined, {
        logo: overrideLogo,
        logoColor: overrideLogoColor,
      }),
      logoWidth: +overrideLogoWidth,
      links: toArray(overrideLink || serviceLink),
      colorA: makeColor(overrideColorA),
    }
    const color = overrideColorB || serviceColor || defaultColor || 'lightgrey'
    setBadgeColor(badgeData, color)

    return badgeData
  }

  static register({ camp, handleRequest, githubApiProvider }, serviceConfig) {
    const ServiceClass = this // In a static context, "this" is the class.

    camp.route(
      this._regex,
      handleRequest({
        queryParams: this.route.queryParams,
        handler: async (queryParams, match, sendBadge, request) => {
          const namedParams = this._namedParamsForMatch(match)
          const serviceInstance = new ServiceClass(
            {
              sendAndCacheRequest: request.asPromise,
            },
            serviceConfig
          )
          const serviceData = await serviceInstance.invokeHandler(
            namedParams,
            queryParams
          )
          trace.logTrace('outbound', emojic.shield, 'Service data', serviceData)
          const badgeData = this._makeBadgeData(queryParams, serviceData)

          // Assumes the final capture group is the extension
          const format = match.slice(-1)[0]
          sendBadge(format, badgeData)
        },
        cacheLength: this._cacheLength,
      })
    )
  }

  static _validate(data, schema) {
    if (!schema || !schema.isJoi) {
      throw Error('A Joi schema is required')
    }
    const { error, value } = Joi.validate(data, schema, {
      allowUnknown: true,
      stripUnknown: true,
    })
    if (error) {
      trace.logTrace(
        'validate',
        emojic.womanShrugging,
        'Response did not match schema',
        error.message
      )
      throw new InvalidResponse({
        prettyMessage: 'invalid response data',
        underlyingError: error,
      })
    } else {
      trace.logTrace(
        'validate',
        emojic.bathtub,
        'Data after validation',
        value,
        { deep: true }
      )
      return value
    }
  }

  async _request({ url, options = {}, errorMessages = {} }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    logTrace(emojic.bowAndArrow, 'Request', url, '\n', options)
    const { res, buffer } = await this._sendAndCacheRequest(url, options)
    logTrace(emojic.dart, 'Response status code', res.statusCode)
    return checkErrorResponse.asPromise(errorMessages)({ buffer, res })
  }
}

module.exports = BaseService
