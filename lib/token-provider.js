'use strict';

const {
  Token,
  TokenPool,
} = require('./token-pool');

class StaticTokenProvider {
  constructor (tokenValidator, tokenString) {
    if (typeof tokenValidator !== 'function') {
      throw Error('tokenValidator is not a function');
    }
    if (! tokenValidator(tokenString)) {
      throw Error(`Not a valid token: ${tokenString}`);
    }

    this.staticToken = new Token(tokenString, null);
  }

  addToken () {
    throw Error('When using token persistence, do not provide a static gh_token');
  }

  nextToken () {
    return this.staticToken;
  }
}

class PoolingTokenProvider {
  /*
  tokenValidator: A function which returns true if the argument is a valid token.
  */
  constructor (tokenValidator) {
    if (typeof tokenValidator !== 'function') {
      throw Error('tokenValidator is not a function');
    }

    Object.assign(this, {
      tokenValidator,
      batchSize: 25,
      searchBatchSize: 5,
    });

    this.tokenPool = new TokenPool(this.batchSize);
  }

  addToken (tokenString) {
    if (! this.tokenValidator(tokenString)) {
      throw Error(`Not a valid token: ${tokenString}`);
    }

    this.tokenPool.add(tokenString, null, this.batchSize);
  }

  nextToken () {
    return this.tokenPool.next();
  }

  // Return an array of token strings.
  toNative () {
    const result = [];

    this.tokenPool.forEach(token => {
      result.push(token.id);
    });

    return result;
  }
}

module.exports = {
  StaticTokenProvider,
  PoolingTokenProvider
};
