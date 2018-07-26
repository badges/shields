'use strict';

const { expect } = require('chai');
const { PoolingTokenProvider } = require('./token-provider');
const GithubApiProvider = require('./github-api-provider');
const serverSecrets = require('../server-secrets');

describe('Github provider with token pool', function() {
  const githubUri = process.env.GITHUB_URL || 'https://api.github.com';
  const reserveFraction = 0.333;

  let tokenProvider, githubApiProvider;
  before(function() {
    tokenProvider = new PoolingTokenProvider();
    tokenProvider.addToken(serverSecrets.gh_token);

    githubApiProvider = new GithubApiProvider(githubUri, tokenProvider);
    githubApiProvider.reserveFraction = reserveFraction;
  });

  const headers = [];
  async function performOneRequest() {
    const { res } = await githubApiProvider.requestAsPromise(
      require('request'),
      '/repos/rust-lang/rust',
      {}
    );
    expect(res.statusCode).to.equal(200);
    headers.push(res.headers);
  }

  before('should be able to run 10 requests', async function() {
    this.timeout(10000);
    for (let i = 0; i < 10; ++i) {
      await performOneRequest();
    }
  });

  it('should decrement the limit remaining with each request', function() {
    const remaining = headers.map(h => +h['x-ratelimit-remaining']);
    const expected = Array.from({ length: 10 }, (e, i) => remaining[0] - i);
    expect(remaining).to.deep.equal(expected);
  });

  it('should update the token with the final limit remaining and reset time', function() {
    const lastHeaders = headers.slice(-1)[0];
    const reserve = reserveFraction * +lastHeaders['x-ratelimit-limit'];
    const usesRemaining = +lastHeaders['x-ratelimit-remaining'] - reserve;
    const nextReset = +lastHeaders['x-ratelimit-reset'];

    const tokens = [];
    tokenProvider.tokenPool.forEach(t => {
      tokens.push(t);
    });

    // Confidence check.
    expect(tokens).to.have.lengthOf(1);

    const token = tokens[0];
    expect(token.usesRemaining).to.equal(usesRemaining);
    expect(token.nextReset).to.equal(nextReset);
  });
});
