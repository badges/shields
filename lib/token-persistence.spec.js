'use strict';

const fs = require('fs');
const tmp = require('tmp');
const readFile = require('fs-readfile-promise');
const sinon = require('sinon');
const wait = require('wait-promise');
const { expect } = require('chai');
const { PoolingTokenProvider } = require('./token-provider');
const TokenPersistence = require('./token-persistence');

describe('Token persistence', function() {
  // Fake timers must be set up before any timers are scheduled.
  let clock;
  beforeEach(function() {
    clock = sinon.useFakeTimers();
  });
  afterEach(function() {
    clock.restore();
  });

  let path, tokenProvider, persistence;
  beforeEach(function() {
    path = tmp.tmpNameSync();
    tokenProvider = new PoolingTokenProvider();
    persistence = new TokenPersistence(tokenProvider, path);
  });
  afterEach(function() {
    if (persistence) {
      persistence.stop();
      persistence = null;
    }
  });

  context('when the file does not exist', function() {
    it('creates it with an empty array', async function() {
      await persistence.initialize();
      const json = JSON.parse(await readFile(path));

      expect(json).to.deep.equal([]);
    });
  });

  context('when the file exists', function() {
    it('adds the contents to the token provider', async function() {
      const initialTokens = ['a', 'b', 'c'].map(char => char.repeat(40));
      fs.writeFileSync(path, JSON.stringify(initialTokens));

      await persistence.initialize();

      expect(tokenProvider.toNative()).to.deep.equal(initialTokens);
    });
  });

  context('when shutting down', function() {
    it('writes added tokens to the file', async function() {
      const initialTokens = ['a', 'b', 'c'].map(char => char.repeat(40));
      fs.writeFileSync(path, JSON.stringify(initialTokens));

      const newToken = 'e'.repeat(40);
      const expected = initialTokens.slice();
      expected.push(newToken);

      await persistence.initialize();
      tokenProvider.addToken(newToken);
      await persistence.stop();

      const json = JSON.parse(await readFile(path));
      expect(json).to.deep.equal(expected);
    });
  });

  context('time has elapsed', function() {
    it('writes added tokens to the file', async function() {
      const addedTokens = ['d', 'e'].map(char => char.repeat(40));

      await persistence.initialize();

      addedTokens.forEach(t => {
        tokenProvider.addToken(t);
      });
      clock.tick(5000);
      clock.restore();

      // Give the save a brief moment to complete before reading.
      await wait.sleep(10);

      const json = JSON.parse(await readFile(path));
      expect(json).to.deep.equal(addedTokens);
    });
  });
});
