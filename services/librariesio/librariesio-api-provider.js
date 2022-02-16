import { ImproperlyConfigured } from '../index.js'
import log from '../../core/server/log.js'
import { TokenPool } from '../../core/token-pooling/token-pool.js'
import { getUserAgent } from '../../core/base-service/got-config.js'

const userAgent = getUserAgent()

// Provides an interface to the Libraries.io API.
export default class LibrariesIoApiProvider {
  constructor({ baseUrl, tokens = [], defaultRateLimit = 60 }) {
    const withPooling = tokens.length > 1
    Object.assign(this, {
      baseUrl,
      withPooling,
      globalToken: tokens[0],
      defaultRateLimit,
    })

    if (this.withPooling) {
      this.standardTokens = new TokenPool({ batchSize: 45 })
      tokens.forEach(t => this.standardTokens.add(t, {}, defaultRateLimit))
    }
  }

  getRateLimitFromHeaders({ headers, token }) {
    // The Libraries.io API does not consistently provide the rate limiting headers.
    // In some cases (e.g. package/version not founds) it won't include any of these headers,
    // and the `retry-after` header is only provided _after_ the rate limit has been exceeded
    // and requests are throttled.
    //
    // https://github.com/librariesio/libraries.io/issues/2860

    // The standard rate limit is 60/requests/minute, so fallback to that default
    // if the header isn't present.
    // https://libraries.io/api#rate-limit
    const rateLimit = +headers['x-ratelimit-limit'] || this.defaultRateLimit

    // If the remaining header is missing, then we're in the 404 response phase, and simply
    // subtract one from the `usesRemaining` count on the token, since the 404 responses do count
    // against the rate limits.
    const totalUsesRemaining =
      +headers['x-ratelimit-remaining'] || token.decrementedUsesRemaining

    // The `retry-after` header is only present post-rate limit excess, and contains the value in
    // seconds the client needs to wait before the limits are reset.
    // Our token pools internally use UTC-based milliseconds, so we perform the conversion
    // if the header is present to ensure the token pool has the correct value.
    // If the header is absent, we just use the current timestamp to
    // advance the value to _something_
    const retryAfter = headers['retry-after']
    const nextReset = Date.now() + (retryAfter ? +retryAfter * 1000 : 0)

    return {
      rateLimit,
      totalUsesRemaining,
      nextReset,
    }
  }

  updateToken({ token, res }) {
    const { totalUsesRemaining, nextReset } = this.getRateLimitFromHeaders({
      headers: res.headers,
      token,
    })
    token.update(totalUsesRemaining, nextReset)
  }

  async fetch(requestFetcher, url, options = {}) {
    const { baseUrl } = this

    let token
    let tokenString
    if (this.withPooling) {
      try {
        token = this.standardTokens.next()
      } catch (e) {
        log.error(e)
        throw new ImproperlyConfigured({
          prettyMessage: 'Unable to select next Libraries.io token from pool',
        })
      }
      tokenString = token.id
    } else {
      tokenString = this.globalToken
    }

    const mergedOptions = {
      ...options,
      ...{
        headers: {
          'User-Agent': userAgent,
          ...options.headers,
        },
        searchParams: {
          api_key: tokenString,
          ...options.searchParams,
        },
      },
    }
    const response = await requestFetcher(`${baseUrl}${url}`, mergedOptions)
    if (this.withPooling) {
      if (response.res.statusCode === 401) {
        this.invalidateToken(token)
      } else if (response.res.statusCode < 500) {
        this.updateToken({ token, url, res: response.res })
      }
    }
    return response
  }
}
