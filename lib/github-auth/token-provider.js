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
    // The Github Search API rate limits are totally separate from the other
    // APIs.
    this.tokenPool = new TokenPool(25);
    this.searchTokenPool = new TokenPool(5);

    // How much of a token's quota do we reserve for the user?
    this.reserve = 0.25;
  }

  addToken (tokenString) {
    this.tokenPool.add(tokenString, null, (1 - this.reserve) * 12500);
    this.searchTokenPool.add(tokenString, null, (1. - this.reserve) * 60);
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
