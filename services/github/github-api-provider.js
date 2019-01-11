'use strict'

const Joi = require('joi')
const { TokenPool } = require('../../lib/token-pool')
const { nonNegativeInteger } = require('../validators')

const headerSchema = Joi.object({
  'x-ratelimit-limit': nonNegativeInteger,
  'x-ratelimit-remaining': nonNegativeInteger,
  'x-ratelimit-reset': nonNegativeInteger,
})
  .required()
  .unknown(true)

// Provides an interface to the Github API. Manages the base URL.
class GithubApiProvider {
  // reserveFraction: The amount of much of a token's quota we avoid using, to
  //   reserve it for the user.
  constructor({
    baseUrl,
    withPooling = true,
    onTokenInvalidated = tokenString => {},
    globalToken,
    reserveFraction = 0.25,
  }) {
    Object.assign(this, {
      baseUrl,
      withPooling,
      onTokenInvalidated,
      globalToken,
      reserveFraction,
    })

    if (this.withPooling) {
      this.standardTokens = new TokenPool({ batchSize: 25 })
      this.searchTokens = new TokenPool({ batchSize: 5 })
    }
  }

  serializeDebugInfo({ sanitize = true } = {}) {
    if (this.withPooling) {
      return {
        standardTokens: this.standardTokens.serializeDebugInfo({ sanitize }),
        searchTokens: this.searchTokens.serializeDebugInfo({ sanitize }),
      }
    } else {
      return {}
    }
  }

  addToken(tokenString) {
    if (this.withPooling) {
      this.standardTokens.add(tokenString)
      this.searchTokens.add(tokenString)
    } else {
      throw Error('When not using a token pool, do not provide tokens')
    }
  }

  updateToken(token, headers) {
    let rateLimit, totalUsesRemaining, nextReset
    try {
      ;({
        'x-ratelimit-limit': rateLimit,
        'x-ratelimit-remaining': totalUsesRemaining,
        'x-ratelimit-reset': nextReset,
      } = Joi.attempt(headers, headerSchema))
    } catch (e) {
      const logHeaders = {
        'x-ratelimit-limit': headers['x-ratelimit-limit'],
        'x-ratelimit-remaining': headers['x-ratelimit-remaining'],
        'x-ratelimit-reset': headers['x-ratelimit-reset'],
      }
      console.log(
        `Invalid GitHub rate limit headers ${JSON.stringify(
          logHeaders,
          undefined,
          2
        )}`
      )
      return
    }

    const reserve = this.reserveFraction * rateLimit
    const usesRemaining = totalUsesRemaining - reserve

    token.update(usesRemaining, nextReset)
  }

  invalidateToken(token) {
    token.invalidate()
    this.onTokenInvalidated(token.id)
  }

  tokenForUrl(url) {
    if (url.startsWith('/search')) {
      return this.searchTokens.next()
    } else {
      return this.standardTokens.next()
    }
  }

  // Act like request(), but tweak headers and query to avoid hitting a rate
  // limit. Inject `request` so we can pass in `cachingRequest` from
  // `request-handler.js`.
  request(request, url, query, callback) {
    const { baseUrl } = this

    let token
    let tokenString
    if (this.withPooling) {
      try {
        token = this.tokenForUrl(url)
      } catch (e) {
        callback(e)
        return
      }
      tokenString = token.id
    } else {
      tokenString = this.globalToken
    }

    const options = {
      url,
      baseUrl,
      qs: query,
      headers: {
        'User-Agent': 'Shields.io',
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${tokenString}`,
      },
    }

    request(options, (err, res, buffer) => {
      if (err === null) {
        if (this.withPooling) {
          if (res.statusCode === 401) {
            this.invalidateToken(token)
          } else if (res.statusCode < 500) {
            this.updateToken(token, res.headers)
          }
        }
      }
      callback(err, res, buffer)
    })
  }

  requestAsPromise(request, url, query) {
    return new Promise((resolve, reject) => {
      this.request(request, url, query, (err, res, buffer) => {
        if (err) {
          reject(err)
        } else {
          resolve({ res, buffer })
        }
      })
    })
  }
}

module.exports = GithubApiProvider
