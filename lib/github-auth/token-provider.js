'use strict';

const { Token, TokenPool } = require('./token-pool');
const isValidToken = require('./is-valid-token');

class StaticTokenProvider {
  constructor(tokenString) {
    if (!isValidToken(tokenString)) {
      throw Error(`Not a valid Github token: ${tokenString}`);
    }

    this.staticToken = new Token(tokenString, null);
  }

  addToken() {
    throw Error(
      'When using token persistence, do not provide a static gh_token'
    );
  }

  nextToken() {
    return this.staticToken;
  }

  nextSearchToken() {
    return this.staticToken;
  }
}

class PoolingTokenProvider {
  constructor() {
    Object.assign(this, {
      batchSize: 25,
      searchBatchSize: 5,
    });

    // The Github Search API rate limits are totally separate from the other
    // APIs.
    this.tokenPool = new TokenPool(this.batchSize);
    this.searchTokenPool = new TokenPool(this.searchBatchSize);
  }

  addToken(tokenString) {
    if (!isValidToken(tokenString)) {
      throw Error(`Not a valid Github token: ${tokenString}`);
    }

    this.tokenPool.add(tokenString, null, this.batchSize);
    this.searchTokenPool.add(tokenString, null, this.searchBatchSize);
  }

  nextToken() {
    return this.tokenPool.next();
  }

  nextSearchToken() {
    return this.searchTokenPool.next();
  }

  // Return an array of token strings.
  toNative() {
    return this.tokenPool.allValidTokenIds();
  }

  serializeDebugInfo(options) {
    return {
      tokenPool: this.tokenPool.serializeDebugInfo(options),
      searchTokenPool: this.tokenPool.serializeDebugInfo(options),
    };
  }
}

module.exports = {
  StaticTokenProvider,
  PoolingTokenProvider,
};
