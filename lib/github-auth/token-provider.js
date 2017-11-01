'use strict';

const {
  Token,
  TokenPool,
} = require('./token-pool');

class StaticTokenProvider {
  constructor (tokenString) {
    this.staticToken = new Token(tokenString, null);
  }

  addToken () {
    throw Error('When using token persistence, do not provide a static gh_token');
  }

  nextToken () {
    return this.staticToken;
  }

  nextSearchToken () {
    return this.staticToken;
  }
}

class PoolingTokenProvider {
  constructor () {
    Object.assign(this, {
      batchSize: 25,
      searchBatchSize: 5,
    });

    // The Github Search API rate limits are totally separate from the other
    // APIs.
    this.tokenPool = new TokenPool(this.batchSize);
    this.searchTokenPool = new TokenPool(this.searchBatchSize);
  }

  addToken (tokenString) {
    this.tokenPool.add(tokenString, null, this.batchSize);
    this.searchTokenPool.add(tokenString, null, this.searchBatchSize);
  }

  nextToken () {
    return this.tokenPool.next();
  }

  nextSearchToken () {
    return this.searchTokenPool.next();
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
