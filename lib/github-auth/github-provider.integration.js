'use strict';

const assert = require('assert');
const mapSeries = require('promise-map-series');
const request = require('request');
const { PoolingTokenProvider } = require('./token-provider');
const GithubProvider = require('./github-provider');
const serverSecrets = require('../server-secrets');

// Since we're migrating away from callbacks, wrap this in a promise so we can
// write a promise-based test.
function requestAsPromise(githubProvider, url, query) {
  return new Promise((resolve, reject) => {
    githubProvider.request(request, url, query, (err, res, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve({ res, buffer });
      }
    });
  });
}

describe('Github provider with token pool', function () {
  const githubUri = process.env.GITHUB_URL || 'https://api.github.com';
  const reserveFraction = 0.333;

  let tokenProvider, githubProvider;
  before(function () {
    tokenProvider = new PoolingTokenProvider();
    tokenProvider.addToken(serverSecrets.gh_token);

    githubProvider = new GithubProvider(githubUri, tokenProvider);
    githubProvider.reserveFraction = reserveFraction;
  });

  const headers = [];
  const performOneRequest = () => requestAsPromise(githubProvider, '/repos/rust-lang/rust', {})
    .then(({ res, buffer }) => {
      assert.equal(res.statusCode, 200);
      headers.push(res.headers);
    });

  before('should be able to run 10 requests', function () {
    this.timeout(10000);
    return mapSeries(Array.from({ length: 10 }), performOneRequest);
  });

  it('should decrement the limit remaining with each request', function () {
    const remaining = headers.map(h => +h['x-ratelimit-remaining']);
    const expected = Array.from({ length: 10 }, (e, i) => remaining[0] - i);
    assert.deepEqual(remaining, expected);
  });

  it('should update the token with the final limit remaining and reset time', function () {
    const lastHeaders = headers.slice(-1)[0];
    const reserve = reserveFraction * +lastHeaders['x-ratelimit-limit'];
    const usesRemaining = +lastHeaders['x-ratelimit-remaining'] - reserve;
    const nextReset = +lastHeaders['x-ratelimit-reset'];

    const tokens = [];
    tokenProvider.tokenPool.forEach(t => {
      tokens.push(t);
    });

    // Confidence check.
    assert.equal(tokens.length, 1);

    const token = tokens[0];
    assert.equal(token.usesRemaining, usesRemaining);
    assert.equal(token.nextReset, nextReset);
  });
});
