'use strict';

const assert = require('assert');
const fs = require('fs');
const tmp = require('tmp');
const readFile = require('fs-readfile-promise');
const sinon = require('sinon');
const wait = require('wait-promise');
const { PoolingTokenProvider } = require('./token-provider');
const TokenPersistence = require('./token-persistence');


describe('Token persistence', function () {
  // Fake timers must be set up before any timers are scheduled.
  let clock;
  beforeEach(function () {
    clock = sinon.useFakeTimers();
  });
  afterEach(function () {
    clock.restore();
  });

  let path, tokenProvider, persistence;
  beforeEach(function () {
    path = tmp.tmpNameSync();
    tokenProvider = new PoolingTokenProvider();
    persistence = new TokenPersistence(tokenProvider, path);
  });
  afterEach(function () {
    if (persistence) {
      persistence.stop();
      persistence = null;
    }
  });

  context('when the file does not exist', function () {
    it('creates it with an empty array', function () {
      return persistence.initialize()
        .then(() => readFile(path))
        .then(buffer => {
          const json = JSON.parse(buffer);
          assert.deepEqual(json, []);
        });
    });
  });

  context('when the file exists', function () {
    it('adds the contents to the token provider', function () {
      const initialTokens = ['a', 'b', 'c'].map(char => char.repeat(40));
      fs.writeFileSync(path, JSON.stringify(initialTokens));

      return persistence.initialize()
        .then(() => {
          assert.deepEqual(tokenProvider.toNative(), initialTokens);
        });
    });
  });

  context('when shutting down', function () {
    it('writes added tokens to the file', function () {
      const initialTokens = ['a', 'b', 'c'].map(char => char.repeat(40));
      fs.writeFileSync(path, JSON.stringify(initialTokens));

      const newToken = 'e'.repeat(40);
      const expected = initialTokens.slice();
      expected.push(newToken);

      return persistence.initialize()
        .then(() => {
          tokenProvider.addToken(newToken);
          return persistence.stop();
        })
        .then(() => readFile(path))
        .then(buffer => {
          const json = JSON.parse(buffer);
          assert.deepEqual(json, expected);
        });
    });
  });

  context('time has elapsed', function () {
    it('writes added tokens to the file', function () {
      const addedTokens = ['d', 'e'].map(char => char.repeat(40));

      return persistence.initialize()
        .then(() => {
          addedTokens.forEach(t => {
            tokenProvider.addToken(t);
          });
          clock.tick(5000);
          clock.restore();
        })
        // Give the save a brief moment to complete before reading.
        .then(() => wait.sleep(10))
        .then(() => readFile(path))
        .then(buffer => {
          const json = JSON.parse(buffer);
          assert.deepEqual(json, addedTokens);
        });
    });
  });
});
