import { URL } from 'url'
import dayjs from 'dayjs'
import Joi from 'joi'
import checkErrorResponse from './check-error-response.js'
import { InvalidParameter, InvalidResponse } from './errors.js'
import { fetch } from './got.js'
import { parseJson } from './json.js'
import validate from './validate.js'

let jwtCache = Object.create(null)

class AuthHelper {
  constructor(
    {
      userKey,
      passKey,
      authorizedOrigins,
      serviceKey,
      isRequired = false,
      defaultToEmptyStringForUser = false,
    },
    config,
  ) {
    if (!userKey && !passKey) {
      throw Error('Expected userKey or passKey to be set')
    }

    if (!authorizedOrigins && !serviceKey) {
      throw Error('Expected authorizedOrigins or serviceKey to be set')
    }

    this._userKey = userKey
    this._passKey = passKey
    if (userKey) {
      this._user = config.private[userKey]
    } else {
      this._user = defaultToEmptyStringForUser ? '' : undefined
    }
    this._pass = passKey ? config.private[passKey] : undefined
    this.isRequired = isRequired

    if (serviceKey !== undefined && !(serviceKey in config.public.services)) {
      // Keep this as its own error, as it's useful to the programmer as they're
      // getting auth set up.
      throw Error(`Service key ${serviceKey} was missing from config schema`)
    }

    let requireStrictSsl, requireStrictSslToAuthenticate
    if (serviceKey === undefined) {
      requireStrictSsl = true
      requireStrictSslToAuthenticate = true
    } else {
      ;({
        authorizedOrigins,
        requireStrictSsl = true,
        requireStrictSslToAuthenticate = true,
      } = config.public.services[serviceKey])
    }
    if (!Array.isArray(authorizedOrigins)) {
      throw Error('Expected authorizedOrigins to be an array of origins')
    }
    this._authorizedOrigins = authorizedOrigins
    this._requireStrictSsl = requireStrictSsl
    this._requireStrictSslToAuthenticate = requireStrictSslToAuthenticate
  }

  get isConfigured() {
    return (
      this._authorizedOrigins.length > 0 &&
      (this._userKey ? Boolean(this._user) : true) &&
      (this._passKey ? Boolean(this._pass) : true)
    )
  }

  get isValid() {
    if (this.isRequired) {
      return this.isConfigured
    } else {
      const configIsEmpty = !this._user && !this._pass
      return this.isConfigured || configIsEmpty
    }
  }

  static _isInsecureSslRequest({ options = {} }) {
    const strictSSL = options?.https?.rejectUnauthorized ?? true
    return strictSSL !== true
  }

  enforceStrictSsl({ options = {} }) {
    if (
      this._requireStrictSsl &&
      this.constructor._isInsecureSslRequest({ options })
    ) {
      throw new InvalidParameter({ prettyMessage: 'strict ssl is required' })
    }
  }

  isAllowedOrigin(url) {
    let parsed
    try {
      parsed = new URL(url)
    } catch (e) {
      throw new InvalidParameter({ prettyMessage: 'invalid url parameter' })
    }

    const { protocol, host } = parsed
    const origin = `${protocol}//${host}`
    return this._authorizedOrigins.includes(origin)
  }

  shouldAuthenticateRequest({ url, options = {} }) {
    const originViolation = !this.isAllowedOrigin(url)

    const strictSslCheckViolation =
      this._requireStrictSslToAuthenticate &&
      this.constructor._isInsecureSslRequest({ options })

    return this.isConfigured && !originViolation && !strictSslCheckViolation
  }

  get _basicAuth() {
    const { _user: username, _pass: password } = this
    return this.isConfigured
      ? { username: username || '', password: password || '' }
      : undefined
  }

  /*
   * Helper function for `withBasicAuth()` and friends.
   */
  _withAnyAuth(requestParams, mergeAuthFn) {
    this.enforceStrictSsl(requestParams)

    const shouldAuthenticate = this.shouldAuthenticateRequest(requestParams)
    if (this.isRequired && !shouldAuthenticate) {
      throw new InvalidParameter({
        prettyMessage: 'requested origin not authorized',
      })
    }

    return shouldAuthenticate ? mergeAuthFn(requestParams) : requestParams
  }

  static _mergeAuth(requestParams, auth) {
    const { options, ...rest } = requestParams
    return {
      options: {
        ...auth,
        ...options,
      },
      ...rest,
    }
  }

  withBasicAuth(requestParams) {
    return this._withAnyAuth(requestParams, requestParams =>
      this.constructor._mergeAuth(requestParams, this._basicAuth),
    )
  }

  _bearerAuthHeader(bearerKey) {
    const { _pass: pass } = this
    return this.isConfigured
      ? { Authorization: `${bearerKey} ${pass}` }
      : undefined
  }

  _apiKeyHeader(apiKeyHeader) {
    const { _pass: pass } = this
    return this.isConfigured ? { [apiKeyHeader]: pass } : undefined
  }

  static _mergeHeaders(requestParams, headers) {
    const {
      options: { headers: existingHeaders, ...restOptions } = {},
      ...rest
    } = requestParams
    return {
      options: {
        headers: {
          ...existingHeaders,
          ...headers,
        },
        ...restOptions,
      },
      ...rest,
    }
  }

  withApiKeyHeader(requestParams, header = 'x-api-key') {
    return this._withAnyAuth(requestParams, requestParams =>
      this.constructor._mergeHeaders(requestParams, this._apiKeyHeader(header)),
    )
  }

  withBearerAuthHeader(
    requestParams,
    bearerKey = 'Bearer', // lgtm [js/hardcoded-credentials]
  ) {
    return this._withAnyAuth(requestParams, requestParams =>
      this.constructor._mergeHeaders(
        requestParams,
        this._bearerAuthHeader(bearerKey),
      ),
    )
  }

  static _mergeQueryParams(requestParams, query) {
    const {
      options: { searchParams: existingQuery, ...restOptions } = {},
      ...rest
    } = requestParams
    return {
      options: {
        searchParams: {
          ...existingQuery,
          ...query,
        },
        ...restOptions,
      },
      ...rest,
    }
  }

  withQueryStringAuth({ userKey, passKey }, requestParams) {
    return this._withAnyAuth(requestParams, requestParams =>
      this.constructor._mergeQueryParams(requestParams, {
        ...(userKey ? { [userKey]: this._user } : undefined),
        ...(passKey ? { [passKey]: this._pass } : undefined),
      }),
    )
  }

  static _getJwtExpiry(token, max = dayjs().add(1, 'hours').unix()) {
    // get the expiry timestamp for this JWT (capped at a max length)
    const parts = token.split('.')

    if (parts.length < 2) {
      throw new InvalidResponse({
        prettyMessage: 'invalid response data from auth endpoint',
      })
    }

    const json = validate(
      {
        ErrorClass: InvalidResponse,
        prettyErrorMessage: 'invalid response data from auth endpoint',
      },
      parseJson(Buffer.from(parts[1], 'base64').toString()),
      Joi.object({ exp: Joi.number().required() }).required(),
    )

    return Math.min(json.exp, max)
  }

  static _isJwtValid(expiry) {
    // we consider the token valid if the expiry
    // datetime is later than (now + 1 minute)
    return dayjs.unix(expiry).isAfter(dayjs().add(1, 'minutes'))
  }

  async _getJwt(loginEndpoint) {
    const { _user: username, _pass: password } = this

    // attempt to get JWT from cache
    if (
      jwtCache?.[loginEndpoint]?.[username]?.token &&
      jwtCache?.[loginEndpoint]?.[username]?.expiry &&
      this.constructor._isJwtValid(jwtCache[loginEndpoint][username].expiry)
    ) {
      // cache hit
      return jwtCache[loginEndpoint][username].token
    }

    // cache miss - request a new JWT
    const originViolation = !this.isAllowedOrigin(loginEndpoint)
    if (originViolation) {
      throw new InvalidParameter({
        prettyMessage: 'requested origin not authorized',
      })
    }

    const { buffer } = await checkErrorResponse({})(
      await fetch(loginEndpoint, {
        method: 'POST',
        form: { username, password },
      }),
    )

    const json = validate(
      {
        ErrorClass: InvalidResponse,
        prettyErrorMessage: 'invalid response data from auth endpoint',
      },
      parseJson(buffer),
      Joi.object({ token: Joi.string().required() }).required(),
    )

    const token = json.token
    const expiry = this.constructor._getJwtExpiry(token)

    // store in the cache
    if (!(loginEndpoint in jwtCache)) {
      jwtCache[loginEndpoint] = {}
    }
    jwtCache[loginEndpoint][username] = { token, expiry }

    return token
  }

  async _getJwtAuthHeader(loginEndpoint) {
    if (!this.isConfigured) {
      return undefined
    }

    const token = await this._getJwt(loginEndpoint)
    return { Authorization: `Bearer ${token}` }
  }

  async withJwtAuth(requestParams, loginEndpoint) {
    const authHeader = await this._getJwtAuthHeader(loginEndpoint)
    return this._withAnyAuth(requestParams, requestParams =>
      this.constructor._mergeHeaders(requestParams, authHeader),
    )
  }
}

function clearJwtCache() {
  jwtCache = Object.create(null)
}

export { AuthHelper, clearJwtCache }
