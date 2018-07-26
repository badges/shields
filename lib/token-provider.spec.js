'use strict';

const assert = require('assert');
const { PoolingTokenProvider } = require('./token-provider');
const isValidGithubToken = require('./github-auth/is-valid-token')

describe('The token provider', function () {
  describe('toNative', function () {
    it('should return the expected value', function () {
      const tokens = ['1', '2', '3', '4', '5'].map(c => c.repeat(40));
      const provider = new PoolingTokenProvider(isValidGithubToken);
      tokens.forEach(t => provider.addToken(t));
      assert.deepStrictEqual(
        provider.toNative().sort(),
        Array.from(tokens).sort()
      );
    });
  });
});
