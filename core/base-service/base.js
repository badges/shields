'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const Joi = require('joi')
const { checkErrorResponse } = require('../../lib/error-helper')
const { assertValidCategory } = require('../../services/categories')
const coalesceBadge = require('./coalesce-badge')
const {
  NotFound,
  InvalidResponse,
  Inaccessible,
  InvalidParameter,
  Deprecated,
} = require('./errors')
const {
  makeFullUrl,
  assertValidRoute,
  prepareRoute,
  namedParamsForMatch,
} = require('./route')
const { assertValidServiceDefinition } = require('./service-definitions')
const trace = require('./trace')
const { validateExample, transformExample } = require('./transform-example')
const validate = require('./validate')

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

module.exports = class BaseService {
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
   * keywords: Additional keywords, other than words in the title. This helps
   *   users locate relevant badges.
   * documentation: An HTML string that is included in the badge popup.
   */
  static get examples() {
    return []
  }

  static validateDefinition() {
    assertValidCategory(this.category, `Category for ${this.name}`)

    assertValidRoute(this.route, `Route for ${this.name}`)

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

    let base, format, pattern, queryParams
    try {
      ;({ base, format, pattern, query: queryParams = [] } = this.route)
    } catch (e) {
      // Legacy services do not have a route.
    }

    const examples = this.examples.map((example, index) =>
      transformExample(example, index, this)
    )

    let route
    if (pattern) {
      route = { pattern: makeFullUrl(base, pattern), queryParams }
    } else if (format) {
      route = { format, queryParams }
    } else {
      route = undefined
    }

    const result = { category, name, isDeprecated, route, examples }

    assertValidServiceDefinition(result, `getDefinition() for ${this.name}`)

    return result
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

  static register({ camp, handleRequest, githubApiProvider }, serviceConfig) {
    const { cacheHeaders: cacheHeaderConfig, fetchLimitBytes } = serviceConfig
    const { regex, captureNames } = prepareRoute(this.route)

    camp.route(
      regex,
      handleRequest(cacheHeaderConfig, {
        queryParams: this.route.queryParams,
        handler: async (queryParams, match, sendBadge, request) => {
          const namedParams = namedParamsForMatch(captureNames, match, this)
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

          const badgeData = coalesceBadge(
            queryParams,
            serviceData,
            this.defaultBadgeData,
            this
          )
          // The final capture group is the extension.
          const format = match.slice(-1)[0]
          sendBadge(format, badgeData)
        },
        cacheLength: this._cacheLength,
        fetchLimitBytes,
      })
    )
  }

  static _validate(
    data,
    schema,
    {
      prettyErrorMessage = 'invalid response data',
      includeKeys = false,
      allowAndStripUnknownKeys = true,
    } = {}
  ) {
    return validate(
      {
        ErrorClass: InvalidResponse,
        prettyErrorMessage,
        includeKeys,
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
