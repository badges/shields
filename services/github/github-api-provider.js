import Joi from 'joi'
import log from '../../core/server/log.js'
import {
  TokenPool,
  sanitizeToken,
} from '../../core/token-pooling/token-pool.js'
import { getUserAgent } from '../../core/base-service/got-config.js'
import { nonNegativeInteger } from '../validators.js'
import { ImproperlyConfigured } from '../index.js'

const userAgent = getUserAgent()

const headerSchema = Joi.object({
  'x-ratelimit-limit': nonNegativeInteger,
  'x-ratelimit-remaining': nonNegativeInteger,
  'x-ratelimit-reset': nonNegativeInteger,
})
  .required()
  .unknown(true)

const bodySchema = Joi.object({
  data: Joi.object({
    rateLimit: Joi.object({
      limit: nonNegativeInteger,
      remaining: nonNegativeInteger,
      resetAt: Joi.date().iso(),
    })
      .required()
      .unknown(true),
  })
    .required()
    .unknown(true),
})
  .required()
  .unknown(true)

// Provides an interface to the Github API. Manages the base URL.
class GithubApiProvider {
  static AUTH_TYPES = {
    NO_AUTH: 'No Auth',
    GLOBAL_TOKEN: 'Global Token',
    TOKEN_POOL: 'Token Pool',
  }

  // reserveFraction: The amount of much of a token's quota we avoid using, to
  //   reserve it for the user.
  // maxTokenFailedAttempts: How many consecutive 401s a token may receive
  //   before it is evicted from the pool. Earlier failures rotate to other
  //   tokens and retry this one later.
  constructor({
    baseUrl,
    authType = this.constructor.AUTH_TYPES.NO_AUTH,
    onTokenInvalidated = tokenString => {},
    globalToken,
    reserveFraction = 0.25,
    restApiVersion,
    maxTokenFailedAttempts = 3,
  }) {
    Object.assign(this, {
      baseUrl,
      authType,
      onTokenInvalidated,
      globalToken,
      reserveFraction,
      maxTokenFailedAttempts,
    })

    this.metricInstance = undefined

    if (this.authType === this.constructor.AUTH_TYPES.TOKEN_POOL) {
      this.standardTokens = new TokenPool({ batchSize: 25 })
      this.searchTokens = new TokenPool({ batchSize: 5 })
      this.graphqlTokens = new TokenPool({ batchSize: 25 })
    }
    this.restApiVersion = restApiVersion
  }

  addToken(tokenString) {
    if (this.authType === this.constructor.AUTH_TYPES.TOKEN_POOL) {
      this.standardTokens.add(tokenString)
      this.searchTokens.add(tokenString)
      this.graphqlTokens.add(tokenString)
    } else {
      throw Error('When not using a token pool, do not provide tokens')
    }
  }

  getTokenDebugInfo({ sanitize = true } = {}) {
    if (this.authType === this.constructor.AUTH_TYPES.TOKEN_POOL) {
      return {
        standardTokens: this.standardTokens.serializeDebugInfo({ sanitize }),
        searchTokens: this.searchTokens.serializeDebugInfo({ sanitize }),
        graphqlTokens: this.graphqlTokens.serializeDebugInfo({ sanitize }),
      }
    } else {
      return {}
    }
  }

  getV3RateLimitFromHeaders(headers) {
    const h = Joi.attempt(headers, headerSchema)
    return {
      rateLimit: h['x-ratelimit-limit'],
      totalUsesRemaining: h['x-ratelimit-remaining'],
      nextReset: h['x-ratelimit-reset'],
    }
  }

  getV4RateLimitFromBody(body) {
    const b = Joi.attempt(body, bodySchema)
    return {
      rateLimit: b.data.rateLimit.limit,
      totalUsesRemaining: b.data.rateLimit.remaining,
      nextReset: Date.parse(b.data.rateLimit.resetAt) / 1000,
    }
  }

  updateToken({ token, url, res }) {
    let rateLimit, totalUsesRemaining, nextReset
    if (url.startsWith('/graphql')) {
      try {
        const parsedBody = JSON.parse(res.body)

        if ('message' in parsedBody && !('data' in parsedBody)) {
          if (parsedBody.message === 'Sorry. Your account was suspended.') {
            this.invalidateToken(token, 'account_suspended')
            return
          }
        }

        ;({ rateLimit, totalUsesRemaining, nextReset } =
          this.getV4RateLimitFromBody(parsedBody))
      } catch (e) {
        console.error(
          `Could not extract rate limit info from response body ${res.body}`,
        )
        log.error(e)
        return
      }
    } else {
      try {
        ;({ rateLimit, totalUsesRemaining, nextReset } =
          this.getV3RateLimitFromHeaders(res.headers))
      } catch (e) {
        const logHeaders = {
          'x-ratelimit-limit': res.headers['x-ratelimit-limit'],
          'x-ratelimit-remaining': res.headers['x-ratelimit-remaining'],
          'x-ratelimit-reset': res.headers['x-ratelimit-reset'],
        }
        console.error(
          `Invalid GitHub rate limit headers ${JSON.stringify(
            logHeaders,
            undefined,
            2,
          )}`,
        )
        log.error(e)
        return
      }
    }

    const reserve = Math.ceil(this.reserveFraction * rateLimit)
    const usesRemaining = totalUsesRemaining - reserve

    token.update(usesRemaining, nextReset)
  }

  invalidateToken(token, reason) {
    log.log(
      `GitHub token invalidated and removed from pool (reason: ${reason}, token: ${sanitizeToken(
        token.id,
      )})`,
    )
    if (this.metricInstance) {
      this.metricInstance.noteGithubTokenInvalidation({ reason })
    }
    token.invalidate()
    this.onTokenInvalidated(token.id)
  }

  poolForUrl(url) {
    if (url.startsWith('/search')) {
      return this.searchTokens
    } else if (url.startsWith('/graphql')) {
      return this.graphqlTokens
    } else {
      return this.standardTokens
    }
  }

  // Handle a 401 for a token. A single 401 may be transient, so rather than
  // evicting immediately, we count the failure, rotate to other tokens, and
  // retry this one when it next comes around. Only after
  // `maxTokenFailedAttempts` consecutive failures is the token evicted.
  handleUnauthorized(token, pool) {
    const failedAttempts = token.recordFailedAttempt()
    if (failedAttempts >= this.maxTokenFailedAttempts) {
      this.invalidateToken(token, 'http_401')
    } else {
      log.log(
        `GitHub token got a 401, rotating away and retrying later (attempt ${failedAttempts}/${this.maxTokenFailedAttempts}, token: ${sanitizeToken(
          token.id,
        )})`,
      )
      pool.endBatchFor(token)
    }
  }

  async fetch(requestFetcher, url, options = {}) {
    const { baseUrl } = this

    let token
    let tokenString
    let pool
    if (this.authType === this.constructor.AUTH_TYPES.TOKEN_POOL) {
      pool = this.poolForUrl(url)
      try {
        token = pool.next()
      } catch (e) {
        log.error(e)
        throw new ImproperlyConfigured({
          prettyMessage: 'Unable to select next GitHub token from pool',
        })
      }
      tokenString = token.id
    } else if (this.authType === this.constructor.AUTH_TYPES.GLOBAL_TOKEN) {
      tokenString = this.globalToken
    }

    const mergedOptions = {
      ...options,
      ...{
        headers: {
          'User-Agent': userAgent,
          'X-GitHub-Api-Version': this.restApiVersion,
          ...options.headers,
        },
      },
    }
    if (
      this.authType === this.constructor.AUTH_TYPES.TOKEN_POOL ||
      this.authType === this.constructor.AUTH_TYPES.GLOBAL_TOKEN
    ) {
      mergedOptions.headers.Authorization = `token ${tokenString}`
    }

    const response = await requestFetcher(`${baseUrl}${url}`, mergedOptions)
    if (this.authType === this.constructor.AUTH_TYPES.TOKEN_POOL) {
      if (response.res.statusCode === 401) {
        this.handleUnauthorized(token, pool)
      } else if (response.res.statusCode < 500) {
        // A non-401 response means the token authenticated successfully,
        // so clear any earlier failed attempts.
        token.resetFailedAttempts()
        this.updateToken({ token, url, res: response.res })
      }
    }
    return response
  }
}

export default GithubApiProvider
