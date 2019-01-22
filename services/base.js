'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const pathToRegexp = require('path-to-regexp')
const Joi = require('joi')
const {
  NotFound,
  InvalidResponse,
  Inaccessible,
  InvalidParameter,
  Deprecated,
} = require('./errors')
const coalesce = require('../core/base-service/coalesce')
const validate = require('../core/base-service/validate')
const { checkErrorResponse } = require('../lib/error-helper')
const { toArray } = require('../lib/badge-data')
const { svg2base64 } = require('../lib/svg-helpers')
const {
  decodeDataUrlFromQueryParam,
  prepareNamedLogo,
} = require('../lib/logos')
const trace = require('./trace')
const { validateExample, transformExample } = require('./transform-example')
const { assertValidCategory } = require('./categories')
const { assertValidServiceDefinition } = require('./service-definitions')

const defaultBadgeDataSchema = Joi.object({
  label: Joi.string(),
  color: Joi.string(),
  labelColor: Joi.string(),
  namedLogo: Joi.string(),
}).required()

const optionalStringWhenNamedLogoPrsent = Joi.alternatives().when('namedLogo', {
  is: Joi.string().required(),
  then: Joi.string(),
})

const optionalNumberWhenAnyLogoPresent = Joi.alternatives()
  .when('namedLogo', { is: Joi.string().required(), then: Joi.number() })
  .when('logoSvg', { is: Joi.string().required(), then: Joi.number() })

const serviceDataSchema = Joi.object({
  isError: Joi.boolean(),
  label: Joi.string().allow(''),
  // While a number of badges pass a number here, in the long run we may want
  // `render()` to always return a string.
  message: Joi.alternatives(Joi.string().allow(''), Joi.number()).required(),
  color: Joi.string(),
  link: Joi.string().uri(),
  // Generally services should not use these options, which are provided to
  // support the Endpoint badge.
  labelColor: Joi.string(),
  namedLogo: Joi.string(),
  logoSvg: Joi.string(),
  logoColor: optionalStringWhenNamedLogoPrsent,
  logoWidth: optionalNumberWhenAnyLogoPresent,
  logoPosition: optionalNumberWhenAnyLogoPresent,
  cacheSeconds: Joi.number()
    .integer()
    .min(0),
  style: Joi.string(),
})
  .oxor('namedLogo', 'logoSvg')
  .required()

class BaseService {
  constructor({ sendAndCacheRequest }, { handleInternalErrors }) {
    this._requestFetcher = sendAndCacheRequest
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
    throw new Error(`Category not set for ${this.name}`)
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

  static get isDeprecated() {
    return false
  }

  /**
   * Default data for the badge. Can include label, logo, and color. These
   * defaults are used if the value is neither included in the service data
   * from the handler nor overridden by the user via query parameters.
   */
  static get defaultBadgeData() {
    return {}
  }

  /**
   * Example URLs for this service. These should use the format
   * specified in `route`, and can be used to demonstrate how to use badges for
   * this service.
   *
   * The preferred way to specify an example is with `namedParams` which are
   * substitued into the service's compiled route pattern. The rendered badge
   * is specified with `staticPreview`.
   *
   * For services which use a route `format`, the `pattern` can be specified as
   * part of the example.
   *
   * title: Descriptive text that will be shown next to the badge. The default
   *   is to use the service class name, which probably is not what you want.
   * namedParams: An object containing the values of named parameters to
   *   substitute into the compiled route pattern.
   * queryParams: An object containing query parameters to include in the
   *   example URLs.
   * pattern: The route pattern to compile. Defaults to `this.route.pattern`.
   * staticPreview: A rendered badge of the sort returned by `handle()` or
   *   `render()`: an object containing `message` and optional `label` and
   *   `color`. This is usually generated by invoking `this.render()` with some
   *   explicit props.
   * previewUrl: Deprecated. An explicit example which is rendered as part of
   *   the badge listing.
   * keywords: Additional keywords, other than words in the title. This helps
   *   users locate relevant badges.
   * documentation: An HTML string that is included in the badge popup.
   */
  static get examples() {
    return []
  }

  static _makeFullUrl(partialUrl) {
    return `/${[this.route.base, partialUrl].filter(Boolean).join('/')}`
  }

  static validateDefinition() {
    assertValidCategory(this.category, `Category for ${this.name}`)

    Joi.assert(
      this.defaultBadgeData,
      defaultBadgeDataSchema,
      `Default badge data for ${this.name}`
    )

    this.examples.forEach((example, index) =>
      validateExample(example, index, this)
    )
  }

  static getDefinition() {
    const { category, name, isDeprecated } = this

    let format, pattern, queryParams
    try {
      ;({ format, pattern, query: queryParams = [] } = this.route)
    } catch (e) {
      // Legacy services do not have a route.
    }

    const examples = this.examples.map((example, index) =>
      transformExample(example, index, this)
    )

    let route
    if (pattern) {
      route = { pattern: this._makeFullUrl(pattern), queryParams }
    } else if (format) {
      route = { format, queryParams }
    } else {
      route = undefined
    }

    const result = { category, name, isDeprecated, route, examples }

    assertValidServiceDefinition(result, `getDefinition() for ${this.name}`)

    return result
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
      return new RegExp(
        `^${this._makeFullUrl(this.route.format)}\\.(svg|png|gif|jpg|json)$`
      )
    } else {
      throw Error(`The route for ${this.name} has neither pattern nor format`)
    }
  }

  static get _cacheLength() {
    const cacheLengths = {
      build: 30,
      license: 3600,
      version: 300,
      debug: 60,
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

  _handleError(error) {
    if (error instanceof NotFound || error instanceof InvalidParameter) {
      trace.logTrace('outbound', emojic.noGoodWoman, 'Handled error', error)
      return {
        isError: true,
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
        isError: true,
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
        isError: true,
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

  static async invoke(
    context = {},
    config = {},
    namedParams = {},
    queryParams = {}
  ) {
    trace.logTrace('inbound', emojic.womanCook, 'Service class', this.name)
    trace.logTrace('inbound', emojic.ticket, 'Named params', namedParams)
    trace.logTrace('inbound', emojic.crayon, 'Query params', queryParams)

    const serviceInstance = new this(context, config)

    let serviceData
    try {
      serviceData = await serviceInstance.handle(namedParams, queryParams)
      Joi.assert(serviceData, serviceDataSchema)
    } catch (error) {
      serviceData = serviceInstance._handleError(error)
    }

    trace.logTrace('outbound', emojic.shield, 'Service data', serviceData)

    return serviceData
  }

  // Translate modern badge data to the legacy schema understood by the badge
  // maker. Allow the user to override the label, color, logo, etc. through
  // the query string. Provide support for most badge options via
  // `serviceData` so the Endpoint badge can specify logos and colors, though
  // allow that the user's logo or color to take precedence. A notable
  // exception is the case of errors. When the service specifies that an error
  // has occurred, the user's requested color does not override the error color.
  //
  // Logos are resolved in this manner:
  //
  // 1. When `?logo=` contains the name of one of the Shields logos, or contains
  //    base64-encoded SVG, that logo is used. In the case of a named logo, when
  //    a `&logoColor=` is specified, that color is used. Otherwise the default
  //    color is used. `logoColor` will not be applied to a custom
  //    (base64-encoded) logo; if a custom color is desired the logo should be
  //    recolored prior to making the request. The appearance of the logo can be
  //    customized using `logoWidth`, and in the case of the popout badge,
  //    `logoPosition`. When `?logo=` is specified, any logo-related parameters
  //    specified dynamically by the service, or by default in the service, are
  //    ignored.
  // 2. The second precedence is the dynamic logo returned by a service. This is
  //    used only by the Endpoint badge. The `logoColor` can be overridden by the
  //    query string.
  // 3. In the case of the `social` style only, the last precedence is the
  //    service's default logo. The `logoColor` can be overridden by the query
  //    string.
  static _makeBadgeData(overrides, serviceData) {
    const {
      style: overrideStyle,
      label: overrideLabel,
      logoColor: overrideLogoColor,
      link: overrideLink,
    } = overrides
    // Scoutcamp converts numeric query params to numbers. Convert them back.
    let {
      colorB: overrideColor,
      colorA: overrideLabelColor,
      logoWidth: overrideLogoWidth,
      logoPosition: overrideLogoPosition,
    } = overrides
    if (typeof overrideColor === 'number') {
      overrideColor = `${overrideColor}`
    }
    if (typeof overrideLabelColor === 'number') {
      overrideLabelColor = `${overrideLabelColor}`
    }
    overrideLogoWidth = +overrideLogoWidth || undefined
    overrideLogoPosition = +overrideLogoPosition || undefined
    // `?logo=` could be a named logo or encoded svg. Split up these cases.
    const overrideLogoSvgBase64 = decodeDataUrlFromQueryParam(overrides.logo)
    const overrideNamedLogo = overrideLogoSvgBase64 ? undefined : overrides.logo

    const {
      isError,
      label: serviceLabel,
      message: serviceMessage,
      color: serviceColor,
      labelColor: serviceLabelColor,
      logoSvg: serviceLogoSvg,
      namedLogo: serviceNamedLogo,
      logoColor: serviceLogoColor,
      logoWidth: serviceLogoWidth,
      logoPosition: serviceLogoPosition,
      link: serviceLink,
      cacheSeconds: serviceCacheSeconds,
      style: serviceStyle,
    } = serviceData
    const serviceLogoSvgBase64 = serviceLogoSvg
      ? svg2base64(serviceLogoSvg)
      : undefined

    const {
      color: defaultColor,
      namedLogo: defaultNamedLogo,
      label: defaultLabel,
      labelColor: defaultLabelColor,
    } = this.defaultBadgeData
    const defaultCacheSeconds = this._cacheLength

    const style = coalesce(overrideStyle, serviceStyle)

    const namedLogoSvgBase64 = prepareNamedLogo({
      name: coalesce(
        overrideNamedLogo,
        serviceNamedLogo,
        style === 'social' ? defaultNamedLogo : undefined
      ),
      color: coalesce(
        overrideLogoColor,
        // If the logo has been overridden it does not make sense to inherit
        // the color.
        overrideNamedLogo ? undefined : serviceLogoColor
      ),
    })

    return {
      text: [
        // Use `coalesce()` to support empty labels and messages, as in the
        // static badge.
        coalesce(overrideLabel, serviceLabel, defaultLabel, this.category),
        coalesce(serviceMessage, 'n/a'),
      ],
      color: coalesce(
        // In case of an error, disregard user's color override.
        isError ? undefined : overrideColor,
        serviceColor,
        defaultColor,
        'lightgrey'
      ),
      labelColor: coalesce(
        // In case of an error, disregard user's color override.
        isError ? undefined : overrideLabelColor,
        serviceLabelColor,
        defaultLabelColor
      ),
      template: style,
      logo: coalesce(
        overrideLogoSvgBase64,
        serviceLogoSvgBase64,
        namedLogoSvgBase64
      ),
      logoWidth: coalesce(
        overrideLogoWidth,
        // If the logo has been overridden it does not make sense to inherit
        // the width or position.
        overrideNamedLogo ? undefined : serviceLogoWidth
      ),
      logoPosition: coalesce(
        overrideLogoPosition,
        overrideNamedLogo ? undefined : serviceLogoPosition
      ),
      links: toArray(overrideLink || serviceLink),
      cacheLengthSeconds: coalesce(serviceCacheSeconds, defaultCacheSeconds),
    }
  }

  static register({ camp, handleRequest, githubApiProvider }, serviceConfig) {
    const { cacheHeaders: cacheHeaderConfig, fetchLimitBytes } = serviceConfig
    camp.route(
      this._regex,
      handleRequest(cacheHeaderConfig, {
        queryParams: this.route.queryParams,
        handler: async (queryParams, match, sendBadge, request) => {
          const namedParams = this._namedParamsForMatch(match)
          const serviceData = await this.invoke(
            {
              sendAndCacheRequest: request.asPromise,
              sendAndCacheRequestWithCallbacks: request,
              githubApiProvider,
            },
            serviceConfig,
            namedParams,
            queryParams
          )

          const badgeData = this._makeBadgeData(queryParams, serviceData)
          // The final capture group is the extension.
          const format = match.slice(-1)[0]
          sendBadge(format, badgeData)
        },
        cacheLength: this._cacheLength,
        fetchLimitBytes,
      })
    )
  }

  static _validate(data, schema, { allowAndStripUnknownKeys = true } = {}) {
    return validate(
      {
        ErrorClass: InvalidResponse,
        prettyErrorMessage: 'invalid response data',
        traceErrorMessage: 'Response did not match schema',
        traceSuccessMessage: 'Response after validation',
        allowAndStripUnknownKeys,
      },
      data,
      schema
    )
  }

  static _validateQueryParams(queryParams, queryParamSchema) {
    return validate(
      {
        ErrorClass: InvalidParameter,
        prettyErrorMessage: 'invalid query parameter',
        includeKeys: true,
        traceErrorMessage: 'Query params did not match schema',
        traceSuccessMessage: 'Query params after validation',
      },
      queryParams,
      queryParamSchema
    )
  }

  async _request({ url, options = {}, errorMessages = {} }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    logTrace(emojic.bowAndArrow, 'Request', url, '\n', options)
    const { res, buffer } = await this._requestFetcher(url, options)
    logTrace(emojic.dart, 'Response status code', res.statusCode)
    return checkErrorResponse.asPromise(errorMessages)({ buffer, res })
  }
}

module.exports = BaseService
