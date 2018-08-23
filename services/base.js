'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const {
  NotFound,
  InvalidResponse,
  Inaccessible,
  InvalidParameter,
} = require('./errors')
const queryString = require('query-string')
const {
  makeLogo,
  toArray,
  makeColor,
  setBadgeColor,
} = require('../lib/badge-data')
const trace = require('./trace')

class BaseService {
  constructor({ sendAndCacheRequest }, { handleInternalErrors }) {
    this._sendAndCacheRequest = sendAndCacheRequest
    this._handleInternalErrors = handleInternalErrors
  }

  static render(props) {
    throw new Error(
      `render() function not implemented for ${this.constructor.name}`
    )
  }

  /**
   * Asynchronous function to handle requests for this service. Takes the URL
   * parameters (as defined in the `url` property), performs a request using
   * `this._sendAndCacheRequest`, and returns the badge data.
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
   *  - base: (Optional) The base path of the URLs for this service. This is
   *    used as a prefix.
   *  - format: Regular expression to use for URLs for this service's badges
   *  - capture: Array of names for the capture groups in the regular
   *             expression. The handler will be passed an object containing
   *             the matches.
   *  - queryParams: Array of names for query parameters which will the service
   *                 uses. For cache safety, only the whitelisted query
   *                 parameters will be passed to the handler.
   */
  static get url() {
    throw new Error(`URL not defined for ${this.name}`)
  }

  /**
   * Default data for the badge. Can include things such as default logo, color,
   * etc. These defaults will be used if the value is not explicitly overridden
   * by either the handler or by the user via URL parameters.
   */
  static get defaultBadgeData() {
    return {}
  }

  /**
   * Example URLs for this service. These should use the format
   * specified in `url`, and can be used to demonstrate how to use badges for
   * this service.
   */
  static get examples() {
    return []
  }

  static _makeFullUrl(partialUrl) {
    return '/' + [this.url.base, partialUrl].filter(Boolean).join('/')
  }

  static _makeStaticExampleUrl(serviceData) {
    const badgeData = this._makeBadgeData({}, serviceData)
    const color = badgeData.colorscheme || badgeData.colorB
    return `/badge/${encodeURIComponent(
      badgeData.text[0]
    )}-${encodeURIComponent(badgeData.text[1])}-${color}`
  }

  /**
   * Return an array of examples. Each example is prepared according to the
   * schema in `lib/all-badge-examples.js`.
   */
  static prepareExamples() {
    return this.examples.map(
      ({
        title,
        query,
        exampleUrl,
        previewUrl,
        urlPattern,
        staticExample,
        documentation,
      }) => {
        if (!previewUrl && !staticExample) {
          throw Error(
            `Example for ${
              this.name
            } is missing required previewUrl or staticExample`
          )
        }

        const stringified = queryString.stringify(query)
        const suffix = stringified ? `?${stringified}` : ''

        return {
          title: title ? `${title}` : this.name,
          exampleUri: exampleUrl
            ? `${this._makeFullUrl(exampleUrl, query)}.svg${suffix}`
            : undefined,
          previewUri: staticExample
            ? `${this._makeStaticExampleUrl(staticExample)}.svg`
            : `${this._makeFullUrl(previewUrl, query)}.svg${suffix}`,
          urlPattern: urlPattern
            ? `${this._makeFullUrl(urlPattern, query)}.svg${suffix}`
            : undefined,
          documentation,
        }
      }
    )
  }

  static get _regex() {
    // Regular expressions treat "/" specially, so we need to escape them
    const escapedPath = this.url.format.replace(/\//g, '\\/')
    const fullRegex = `^${this._makeFullUrl(
      escapedPath
    )}.(svg|png|gif|jpg|json)$`
    return new RegExp(fullRegex)
  }

  static _namedParamsForMatch(match) {
    // Assume the last match is the format, and drop match[0], which is the
    // entire match.
    const captures = match.slice(1, -1)

    if (this.url.capture.length !== captures.length) {
      throw new Error(
        `Service ${
          this.constructor.name
        } declares incorrect number of capture groups ` +
          `(expected ${this.url.capture.length}, got ${captures.length})`
      )
    }

    const result = {}
    this.url.capture.forEach((name, index) => {
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
        error instanceof Inaccessible
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
      }),
      logoWidth: +overrideLogoWidth,
      links: toArray(overrideLink || serviceLink),
      colorA: makeColor(overrideColorA),
    }
    const color = overrideColorB || serviceColor || defaultColor || 'lightgrey'
    setBadgeColor(badgeData, color)

    return badgeData
  }

  static register(camp, handleRequest, serviceConfig) {
    const ServiceClass = this // In a static context, "this" is the class.

    camp.route(
      this._regex,
      handleRequest({
        queryParams: this.url.queryParams,
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
      })
    )
  }
}

module.exports = BaseService
