'use strict'

const { Token, TokenPool } = require('./token-pool')

class StaticTokenProvider {
  constructor({ tokenValidator, tokenString }) {
    if (typeof tokenValidator !== 'function') {
      throw Error('tokenValidator is not a function')
    }
    if (!tokenValidator(tokenString)) {
      throw Error(`Not a valid token: ${tokenString}`)
    }

    this.staticToken = new Token(tokenString, null)
  }

  addToken() {
    throw Error(
      'When using token persistence, do not provide a static gh_token'
    )
  }

  nextToken() {
    return this.staticToken
  }
}

class PoolingTokenProvider {
  /*
  tokenValidator: A function which returns true if the argument is a valid token.
  */
  constructor({ tokenValidator, batchSize = 25 }) {
    if (typeof tokenValidator !== 'function') {
      throw Error('tokenValidator is not a function')
    }

    this.tokenValidator = tokenValidator
    this.tokenPool = new TokenPool({ batchSize })
  }

  addToken(tokenString) {
    if (!this.tokenValidator(tokenString)) {
      throw Error(`Not a valid token: ${tokenString}`)
    }

    this.tokenPool.add(tokenString)
  }

  nextToken() {
    return this.tokenPool.next()
  }

  // Return an array of token strings.
  toNative() {
    return this.tokenPool.allValidTokenIds()
  }

  serializeDebugInfo(options) {
    return this.tokenPool.serializeDebugInfo(options)
  }
}

module.exports = {
  StaticTokenProvider,
  PoolingTokenProvider,
}
