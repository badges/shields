'use strict'

const { TokenPool } = require('../../lib/token-pool')

// Provide an interface to the Github API. Manages the base URL.
class GithubApiProvider {
  // reserveFraction: The amount of much of a token's quota we avoid using, to
  //   reserve it for the user.
  constructor({
    baseUrl,
    withPooling = true,
    globalToken,
    reserveFraction = 0.25,
  }) {
    Object.assign(this, { baseUrl, withPooling, globalToken, reserveFraction })

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
      throw Error('When using token pooling, do not provide static tokens')
    }
  }

  updateToken(token, headers) {
    const rateLimit = +headers['x-ratelimit-limit']
    const reserve = this.reserveFraction * rateLimit
    const usesRemaining = +headers['x-ratelimit-remaining'] - reserve

    const nextReset = +headers['x-ratelimit-reset']

    token.update(usesRemaining, nextReset)
  }

  invalidateToken(token) {
    token.invalidate()
    // Also invalidate the corresponding token in the other pool!
  }

  tokenForUrl(url) {
    const { globalToken } = this
    if (globalToken) {
      // When a global gh_token is configured, use that in place of our token
      // pool. This produces more predictable behavior, and more predictable
      // failures when that token is exhausted.
      return globalToken
    } else if (url.startsWith('/search')) {
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
    try {
      token = this.tokenForUrl(url)
    } catch (e) {
      callback(e)
      return
    }

    const options = {
      url,
      baseUrl,
      qs: query,
      headers: {
        'User-Agent': 'Shields.io',
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${token.id}`,
      },
    }

    request(options, (err, res, buffer) => {
      if (err === null) {
        if (res.statusCode === 401) {
          this.invalidateToken(token)
        } else if (res.statusCode < 500) {
          this.updateToken(token, res.headers)
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
