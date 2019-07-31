'use strict'
/**
 * @module
 */

const decamelize = require('decamelize')
// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const Joi = require('@hapi/joi')
const log = require('../server/log')
const { AuthHelper } = require('./auth-helper')
const { assertValidCategory } = require('./categories')
const checkErrorResponse = require('./check-error-response')
const coalesceBadge = require('./coalesce-badge')
const {
  NotFound,
  InvalidResponse,
  Inaccessible,
  ImproperlyConfigured,
  InvalidParameter,
  Deprecated,
} = require('./errors')
const { validateExample, transformExample } = require('./examples')
const {
  makeFullUrl,
  assertValidRoute,
  prepareRoute,
  namedParamsForMatch,
  getQueryParamNames,
} = require('./route')
const { assertValidServiceDefinition } = require('./service-definitions')
const trace = require('./trace')
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
  link: Joi.array()
    .items(Joi.string().uri())
    .single()
    .max(2),
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

/**
 * Abstract base class which all service classes inherit from.
 * Concrete implementations of BaseService must implement the methods
 * category(), route() and handle(namedParams, queryParams)
 */
class BaseService {
  /**
   * Name of the category to sort this badge into (eg. "build"). Used to sort
   * the badges on the main shields.io website.
   *
   * @abstract
   * @type {string}
   */
  static get category() {
    throw new Error(`Category not set for ${this.name}`)
  }

  static get isDeprecated() {
    return false
  }

  /**
   * Route to mount this service on
   *
   * @abstract
   * @type {module:core/base-service/base~Route}
   */
  static get route() {
    throw new Error(`Route not defined for ${this.name}`)
  }

  /**
   * Configuration for the authentication helper that prepares credentials
   * for upstream requests.
   *
   * See also the config schema in `./server.js` and `doc/server-secrets.md`.
   *
   * To use the configured auth in the handler or fetch method, pass the
   * credentials to the request. For example:
   * - `{ options: { auth: this.authHelper.basicAuth } }`
   * - `{ options: { headers: this.authHelper.bearerAuthHeader } }`
   * - `{ options: { qs: { token: this.authHelper.pass } } }`
   *
   * @abstract
   * @type {module:core/base-service/base~Auth}
   */
  static get auth() {
    return undefined
  }

  /**
   * Array of Example objects describing example URLs for this service.
   * These should use the format specified in `route`,
   * and can be used to demonstrate how to use badges for this service.
   *
   * The preferred way to specify an example is with `namedParams` which are
   * substituted into the service's compiled route pattern. The rendered badge
   * is specified with `staticPreview`.
   *
   * For services which use a route `format`, the `pattern` can be specified as
   * part of the example.
   *
   * @see {@link module:core/base-service/base~Example}
   * @abstract
   * @type {module:core/base-service/base~Example[]}
   */
  static get examples() {
    return []
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

  /**
   * Default data for the badge.
   * These defaults are used if the value is neither included in the service data
   * from the handler nor overridden by the user via query parameters.
   *
   * @type {module:core/base-service/base~DefaultBadgeData}
   */
  static get defaultBadgeData() {
    return {}
  }

  static render(props) {
    throw new Error(`render() function not implemented for ${this.name}`)
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
    const { base, format, pattern } = this.route
    const queryParams = getQueryParamNames(this.route)

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

  constructor({ sendAndCacheRequest, authHelper }, { handleInternalErrors }) {
    this._requestFetcher = sendAndCacheRequest
    this.authHelper = authHelper
    this._handleInternalErrors = handleInternalErrors
  }

  async _request({ url, options = {}, errorMessages = {} }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    logTrace(emojic.bowAndArrow, 'Request', url, '\n', options)
    const { res, buffer } = await this._requestFetcher(url, options)
    logTrace(emojic.dart, 'Response status code', res.statusCode)
    return checkErrorResponse(errorMessages)({ buffer, res })
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

  /**
   * Asynchronous function to handle requests for this service. Take the route
   * parameters (as defined in the `route` property), perform a request using
   * `this._sendAndCacheRequest`, and return the badge data.
   *
   * @abstract
   * @param {object} namedParams Params parsed from route pattern
   *    defined in this.route.pattern or this.route.capture
   * @param {object} queryParams Params parsed from the query string
   * @returns {module:core/base-service/base~Badge}
   *    badge Object validated against serviceDataSchema
   */
  async handle(namedParams, queryParams) {
    throw new Error(`Handler not implemented for ${this.constructor.name}`)
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
      error instanceof ImproperlyConfigured ||
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
        // production. Send the error to Sentry and the logs.
        log.error(error)
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

    // Like the service instance, the auth helper could be reused for each request.
    // However, moving its instantiation to `register()` makes `invoke()` harder
    // to test.
    const authHelper = this.auth
      ? new AuthHelper(this.auth, config.private)
      : undefined

    const serviceInstance = new this({ ...context, authHelper }, config)

    let serviceError
    if (authHelper && !authHelper.isValid) {
      const prettyMessage = authHelper.isRequired
        ? 'credentials have not been configured'
        : 'credentials are misconfigured'
      serviceError = new ImproperlyConfigured({ prettyMessage })
    }

    const { queryParamSchema } = this.route
    let transformedQueryParams
    if (!serviceError && queryParamSchema) {
      try {
        transformedQueryParams = validate(
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
        trace.logTrace(
          'inbound',
          emojic.crayon,
          'Query params after validation',
          queryParams
        )
      } catch (error) {
        serviceError = error
      }
    } else {
      transformedQueryParams = {}
    }

    let serviceData
    if (!serviceError) {
      try {
        serviceData = await serviceInstance.handle(
          namedParams,
          transformedQueryParams
        )
        Joi.assert(serviceData, serviceDataSchema)
      } catch (error) {
        serviceError = error
      }
    }

    if (serviceError) {
      serviceData = serviceInstance._handleError(serviceError)
    }

    trace.logTrace('outbound', emojic.shield, 'Service data', serviceData)

    return serviceData
  }

  static _createServiceRequestCounter({ requestCounter }) {
    if (requestCounter) {
      const { category, serviceFamily, name } = this
      const service = decamelize(name)
      return requestCounter.labels(category, serviceFamily, service)
    } else {
      // When metrics are disabled, return a mock counter.
      return { inc: () => {} }
    }
  }

  static register(
    { camp, handleRequest, githubApiProvider, requestCounter },
    serviceConfig
  ) {
    const { cacheHeaders: cacheHeaderConfig, fetchLimitBytes } = serviceConfig
    const { regex, captureNames } = prepareRoute(this.route)
    const queryParams = getQueryParamNames(this.route)

    const serviceRequestCounter = this._createServiceRequestCounter({
      requestCounter,
    })

    camp.route(
      regex,
      handleRequest(cacheHeaderConfig, {
        queryParams,
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
          const format = (match.slice(-1)[0] || '.svg').replace(/^\./, '')
          sendBadge(format, badgeData)

          serviceRequestCounter.inc()
        },
        cacheLength: this._cacheLength,
        fetchLimitBytes,
      })
    )
  }
}

/**
 * Default badge properties, validated against defaultBadgeDataSchema
 *
 * @typedef {object} DefaultBadgeData
 * @property {string} label (Optional)
 * @property {string} color (Optional)
 * @property {string} labelColor (Optional)
 * @property {string} namedLogo (Optional)
 */

/**
 * Badge Object, validated against serviceDataSchema
 *
 * @typedef {object} Badge
 * @property {boolean} isError (Optional)
 * @property {string} label (Optional)
 * @property {(string|number)} message
 * @property {string} color (Optional)
 * @property {string[]} link (Optional)
 */

/**
 * @typedef {object} Route
 * @property {string} base
 *    (Optional) The base path of the routes for this service.
 *    This is used as a prefix.
 * @property {string} pattern
 *    A path-to-regexp pattern defining the route pattern and param names
 *    See {@link https://www.npmjs.com/package/path-to-regexp}
 * @property {RegExp} format
 *    Deprecated: Regular expression to use for routes for this service's badges
 *    Use `pattern` instead
 * @property {string[]} capture
 *    Deprecated: Array of names for the capture groups in the regular
 *    expression. The handler will be passed an object containing
 *    the matches.
 *    Use `pattern` instead
 * @property {Joi.object} queryParamSchema
 *    (Optional) A Joi schema (`Joi.object({ ... }).required()`)
 *    for the query param object. If you know a parameter
 *    will never receive a numeric string, you can use
 *    `Joi.string()`. Because of quirks in Scoutcamp and Joi,
 *    alphanumeric strings should be declared using
 *    `Joi.alternatives().try(Joi.string(), Joi.number())`,
 *    otherwise a value like `?success_color=999` will fail.
 *    A parameter requiring a numeric string can use
 *    `Joi.number()`. A parameter that receives only non-numeric
 *    strings can use `Joi.string()`. A parameter that never
 *    receives numeric can use `Joi.string()`. A boolean
 *    parameter should use `Joi.equal('')` and will receive an
 *    empty string on e.g. `?compact_message` and undefined
 *    when the parameter is absent. (Note that in,
 *    `examples.queryParams` boolean query params should be given
 *    `null` values.)
 */

/**
 * @typedef {object} Auth
 * @property {string} userKey
 *    (Optional) The key from `privateConfig` to use as the username.
 * @property {string} passKey
 *    (Optional) The key from `privateConfig` to use as the password.
 *    If auth is configured, either `userKey` or `passKey` is required.
 * @property {string} isRequired
 *    (Optional) If `true`, the service will return `NotFound` unless the
 *    configured credentials are present.
 */

/**
 * @typedef {object} Example
 * @property {string} title
 *    Descriptive text that will be shown next to the badge. The default
 *    is to use the service class name, which probably is not what you want.
 * @property {object} namedParams
 *    An object containing the values of named parameters to
 *    substitute into the compiled route pattern.
 * @property {object} queryParams
 *    An object containing query parameters to include in the
 *    example URLs. For alphanumeric query parameters, specify a string value.
 *    For boolean query parameters, specify `null`.
 * @property {string} pattern
 *    The route pattern to compile. Defaults to `this.route.pattern`.
 * @property {object} staticPreview
 *    A rendered badge of the sort returned by `handle()` or
 *    `render()`: an object containing `message` and optional `label` and
 *    `color`. This is usually generated by invoking `this.render()` with some
 *    explicit props.
 * @property {string[]} keywords
 *    Additional keywords, other than words in the title. This helps
 *    users locate relevant badges.
 * @property {string} documentation
 *    An HTML string that is included in the badge popup.
 */

module.exports = BaseService
