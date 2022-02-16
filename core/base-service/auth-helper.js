import { URL } from 'url'
import { InvalidParameter } from './errors.js'

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
    config
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

  shouldAuthenticateRequest({ url, options = {} }) {
    let parsed
    try {
      parsed = new URL(url)
    } catch (e) {
      throw new InvalidParameter({ prettyMessage: 'invalid url parameter' })
    }

    const { protocol, host } = parsed
    const origin = `${protocol}//${host}`
    const originViolation = !this._authorizedOrigins.includes(origin)

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
      this.constructor._mergeAuth(requestParams, this._basicAuth)
    )
  }

  _bearerAuthHeader(bearerKey) {
    const { _pass: pass } = this
    return this.isConfigured
      ? { Authorization: `${bearerKey} ${pass}` }
      : undefined
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

  withBearerAuthHeader(
    requestParams,
    bearerKey = 'Bearer' // lgtm [js/hardcoded-credentials]
  ) {
    return this._withAnyAuth(requestParams, requestParams =>
      this.constructor._mergeHeaders(
        requestParams,
        this._bearerAuthHeader(bearerKey)
      )
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
      })
    )
  }
}

export { AuthHelper }
