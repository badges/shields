/**
 * @module
 */

// See available emoji at http://emoji.muan.co/
import emojic from 'emojic'
import Joi from 'joi'
import log from '../server/log.js'
import { AuthHelper } from './auth-helper.js'
import { MetricHelper, MetricNames } from './metric-helper.js'
import { assertValidCategory } from './categories.js'
import checkErrorResponse from './check-error-response.js'
import coalesceBadge from './coalesce-badge.js'
import {
  NotFound,
  InvalidResponse,
  Inaccessible,
  ImproperlyConfigured,
  InvalidParameter,
  Deprecated,
} from './errors.js'
import { fetch } from './got.js'
import { getEnum } from './openapi.js'
import {
  makeFullUrl,
  assertValidRoute,
  prepareRoute,
  namedParamsForMatch,
  getQueryParamNames,
} from './route.js'
import { assertValidServiceDefinition } from './service-definitions.js'
import trace from './trace.js'
import validate from './validate.js'

const defaultBadgeDataSchema = Joi.object({
  label: Joi.string(),
  color: Joi.string(),
  labelColor: Joi.string(),
  namedLogo: Joi.string(),
}).required()

const optionalStringWhenNamedLogoPresent = Joi.alternatives().conditional(
  'namedLogo',
  {
    is: Joi.string().required(),
    then: Joi.string(),
  },
)

const optionalNumberWhenAnyLogoPresent = Joi.alternatives()
  .conditional('namedLogo', { is: Joi.string().required(), then: Joi.number() })
  .conditional('logoSvg', { is: Joi.string().required(), then: Joi.number() })

const serviceDataSchema = Joi.object({
  isError: Joi.boolean(),
  label: Joi.string().allow(''),
  // While a number of badges pass a number here, in the long run we may want
  // `render()` to always return a string.
  message: Joi.alternatives(Joi.string().allow(''), Joi.number()).required(),
  color: Joi.string(),
  link: Joi.array().items(Joi.string().uri()).single().max(2),
  // Generally services should not use these options, which are provided to
  // support the Endpoint badge.
  labelColor: Joi.string(),
  namedLogo: Joi.string(),
  logoSvg: Joi.string(),
  logoColor: optionalStringWhenNamedLogoPresent,
  logoSize: optionalStringWhenNamedLogoPresent,
  logoWidth: optionalNumberWhenAnyLogoPresent,
  cacheSeconds: Joi.number().integer().min(0),
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

  static isDeprecated = false

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
   * Extract an array of allowed values from this service's route pattern
   * for a given route parameter
   *
   * @param {string} param The name of a param in this service's route pattern
   * @returns {string[]} Array of allowed values for this param
   */
  static getEnum(param) {
    if (!('pattern' in this.route)) {
      throw new Error('getEnum() requires route to have a .pattern property')
    }
    const enumeration = getEnum(this.route.pattern, param)
    if (!Array.isArray(enumeration)) {
      throw new Error(
        `Could not extract enum for param ${param} from pattern ${this.route.pattern}`,
      )
    }
    return enumeration
  }

  /**
   * Configuration for the authentication helper that prepares credentials
   * for upstream requests.
   *
   * See also the config schema in `./server.js` and `doc/server-secrets.md`.
   *
   * To use the configured auth in the handler or fetch method, wrap the
   * _request() input params in a call to one of:
   * - this.authHelper.withBasicAuth()
   * - this.authHelper.withBearerAuthHeader()
   * - this.authHelper.withQueryStringAuth()
   *
   * For example:
   * this._request(this.authHelper.withBasicAuth({ url, schema, options }))
   *
   * @abstract
   * @type {module:core/base-service/base~Auth}
   */
  static auth = undefined

  /**
   * An OpenAPI Paths Object describing this service's
   * route or routes in OpenAPI format.
   *
   * @abstract
   * @see https://swagger.io/specification/#paths-object
   * @type {module:core/base-service/service-definitions~openApiSchema}
   */
  static openApi = {}

  static get _cacheLength() {
    const cacheLengths = {
      build: 30,
      license: 3600,
      version: 300,
      debug: 60,
      downloads: 900,
      rating: 900,
      social: 900,
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
  static defaultBadgeData = {}

  static render(props) {
    throw new Error(`render() function not implemented for ${this.name}`)
  }

  static validateDefinition() {
    assertValidCategory(this.category, `Category for ${this.name}`)

    assertValidRoute(this.route, `Route for ${this.name}`)

    Joi.assert(
      this.defaultBadgeData,
      defaultBadgeDataSchema,
      `Default badge data for ${this.name}`,
    )

    // ensure openApi spec matches route
    const preparedRoute = prepareRoute(this.route)
    for (const [key, value] of Object.entries(this.openApi)) {
      let example = key
      for (const param of value.get.parameters) {
        example = example.replace(`{${param.name}}`, param.example)
      }
      if (!example.match(preparedRoute.regex)) {
        throw new Error(
          `Inconsistent Open Api spec and Route found for service ${this.name}`,
        )
      }
    }
  }

  static getDefinition() {
    const { category, name, isDeprecated, openApi } = this
    const { base, format, pattern } = this.route
    const queryParams = getQueryParamNames(this.route)

    let route
    if (pattern) {
      route = { pattern: makeFullUrl(base, pattern), queryParams }
    } else if (format) {
      route = { format, queryParams }
    } else {
      route = undefined
    }

    const result = { category, name, isDeprecated, route, openApi }

    assertValidServiceDefinition(result, `getDefinition() for ${this.name}`)

    return result
  }

  constructor(
    { requestFetcher, authHelper, metricHelper },
    { handleInternalErrors },
  ) {
    this._requestFetcher = requestFetcher
    this.authHelper = authHelper
    this._handleInternalErrors = handleInternalErrors
    this._metricHelper = metricHelper
  }

  async _request({
    url,
    options = {},
    httpErrors = {},
    systemErrors = {},
    logErrors = [429],
  }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    let logUrl = url
    const logOptions = Object.assign({}, options)
    if ('searchParams' in options && options.searchParams != null) {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(options.searchParams).filter(
            ([k, v]) => v !== undefined,
          ),
        ),
      )
      logUrl = `${url}?${params.toString()}`
      delete logOptions.searchParams
    }
    logTrace(
      emojic.bowAndArrow,
      'Request',
      `${logUrl}\n${JSON.stringify(logOptions, null, 2)}`,
    )
    const { res, buffer } = await this._requestFetcher(
      url,
      options,
      systemErrors,
    )
    await this._meterResponse(res, buffer)
    logTrace(emojic.dart, 'Response status code', res.statusCode)
    return checkErrorResponse(httpErrors, logErrors)({ buffer, res })
  }

  static enabledMetrics = []

  static isMetricEnabled(metricName) {
    return this.enabledMetrics.includes(metricName)
  }

  async _meterResponse(res, buffer) {
    if (
      this._metricHelper &&
      this.constructor.isMetricEnabled(MetricNames.SERVICE_RESPONSE_SIZE) &&
      res.statusCode === 200
    ) {
      this._metricHelper.noteServiceResponseSize(buffer.length)
    }
  }

  static _validate(
    data,
    schema,
    {
      prettyErrorMessage = 'invalid response data',
      includeKeys = false,
      allowAndStripUnknownKeys = true,
    } = {},
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
      schema,
    )
  }

  /**
   * Asynchronous function to handle requests for this service. Take the route
   * parameters (as defined in the `route` property), perform a request using
   * `this._requestFetcher`, and return the badge data.
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

  // Making this an instance method ensures debuggability.
  // https://github.com/badges/shields/issues/3784
  _validateServiceData(serviceData) {
    Joi.assert(serviceData, serviceDataSchema)
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
      const serviceData = {
        isError: true,
        message: error.prettyMessage,
        color: 'lightgray',
      }
      if (error.cacheSeconds !== undefined) {
        serviceData.cacheSeconds = error.cacheSeconds
      }
      return serviceData
    } else if (this._handleInternalErrors) {
      if (
        !trace.logTrace(
          'unhandledError',
          emojic.boom,
          'Unhandled internal error',
          error,
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
        error,
      )
      throw error
    }
  }

  static async invoke(
    context = {},
    config = {},
    namedParams = {},
    queryParams = {},
  ) {
    trace.logTrace('inbound', emojic.womanCook, 'Service class', this.name)
    trace.logTrace('inbound', emojic.ticket, 'Named params', namedParams)
    trace.logTrace('inbound', emojic.crayon, 'Query params', queryParams)

    // Like the service instance, the auth helper could be reused for each request.
    // However, moving its instantiation to `register()` makes `invoke()` harder
    // to test.
    const authHelper = this.auth ? new AuthHelper(this.auth, config) : undefined

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
          queryParamSchema,
        )
        trace.logTrace(
          'inbound',
          emojic.crayon,
          'Query params after validation',
          queryParams,
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
          transformedQueryParams,
        )
        serviceInstance._validateServiceData(serviceData)
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

  static register(
    {
      camp,
      handleRequest,
      githubApiProvider,
      librariesIoApiProvider,
      metricInstance,
    },
    serviceConfig,
  ) {
    const { cacheHeaders: cacheHeaderConfig } = serviceConfig
    const { regex, captureNames } = prepareRoute(this.route)
    const queryParams = getQueryParamNames(this.route)

    const metricHelper = MetricHelper.create({
      metricInstance,
      ServiceClass: this,
    })

    camp.route(
      regex,
      handleRequest(cacheHeaderConfig, {
        queryParams,
        handler: async (queryParams, match, sendBadge) => {
          const metricHandle = metricHelper.startRequest()

          const namedParams = namedParamsForMatch(captureNames, match, this)
          const serviceData = await this.invoke(
            {
              requestFetcher: fetch,
              githubApiProvider,
              librariesIoApiProvider,
              metricHelper,
            },
            serviceConfig,
            namedParams,
            queryParams,
          )

          const badgeData = coalesceBadge(
            queryParams,
            serviceData,
            this.defaultBadgeData,
            this,
          )
          // The final capture group is the extension.
          const format = (match.slice(-1)[0] || '.svg').replace(/^\./, '')
          sendBadge(format, badgeData)

          metricHandle.noteResponseSent()
        },
        cacheLength: this._cacheLength,
      }),
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
 *    when the parameter is absent. In the OpenApi definitions,
 *    this type of param should be documented as
 *    queryParam({
 *      name: 'compact_message', schema: { type: 'boolean' }, example: null
 *    })
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

export default BaseService
