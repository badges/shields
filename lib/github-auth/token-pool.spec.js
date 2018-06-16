'use strict';

const assert = require('assert');
const sinon = require('sinon');
const times = require('lodash.times');
const { Token, TokenPool } = require('./token-pool');

function assertPoolExhausted (pool) {
  assert.throws(() => {
    pool.next();
  }, /^Error: Token pool is exhausted$/);
}

describe('The token pool', function () {
  const ids = [1, 2, 3, 4, 5];
  const batchSize = 3;

  let tokenPool;
  beforeEach(function () {
    // Set up.
    tokenPool = new TokenPool(batchSize);
    ids.forEach(id => tokenPool.add(id));
  });

  it('should yield the expected tokens', function () {
    ids.forEach(id => times(batchSize, () => assert.equal(tokenPool.next().id, id)));
  });

  it('should repeat when reaching the end', function () {
    ids.forEach(id => times(batchSize, () => assert.equal(tokenPool.next().id, id)));
    ids.forEach(id => times(batchSize, () => assert.equal(tokenPool.next().id, id)));
  });

  context('tokens are marked exhausted immediately', function () {
    it('should be exhausted', function () {
      ids.forEach(() => {
        const token = tokenPool.next();
        token.update(0, Token.nextResetNever);
      });

      assertPoolExhausted(tokenPool);
    });
  });

  context('tokens are marked after the last request', function () {
    it('should be exhausted', function () {
      ids.forEach(() => {
        const token = times(batchSize, () => tokenPool.next()).pop();
        token.update(0, Token.nextResetNever);
      });

      assertPoolExhausted(tokenPool);
    });
  });

  context('tokens are renewed', function () {
    it('should keep using them', function () {
      const tokensToRenew = [2, 4];
      const renewalCount = 3;

      ids.forEach(id => {
        const token = times(batchSize, () => tokenPool.next()).pop();
        const usesRemaining = tokensToRenew.includes(token.id) ? renewalCount : 0;
        token.update(usesRemaining, Token.nextResetNever);
      });

      tokensToRenew.forEach(id => {
        let token;
        times(renewalCount, () => {
          token = tokenPool.next();
          assert.equal(token.id, id);
        }).pop();
        token.update(0, Token.nextResetNever);
      });

      assertPoolExhausted(tokenPool);
    });
  });

  context('tokens reset', function () {
    let clock;
    beforeEach(function () { clock = sinon.useFakeTimers(); });
    afterEach(function () { clock.restore(); });

    it('should start using them', function () {
      const tokensToReset = [2, 4];
      const futureTime = 1440;

      ids.forEach(id => {
        const token = times(batchSize, () => tokenPool.next()).pop();
        const nextReset = tokensToReset.includes(token.id) ? futureTime : Token.nextResetNever;
        token.update(0, nextReset);
      });

      assertPoolExhausted(tokenPool);

      clock.tick(1000 * futureTime);

      tokensToReset.forEach(id => {
        const token = times(batchSize, () => tokenPool.next()).pop();
        token.update(0, Token.nextResetNever);
      });

      assertPoolExhausted(tokenPool);
    });
  });
});
