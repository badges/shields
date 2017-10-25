'use strict';

const serverSecrets = require('../server-secrets');
const {
  StaticTokenProvider,
  PoolingTokenProvider,
} = require('./token-provider');
const TokenPersistence = require('./persistence');
const GithubProvider = require('./github-provider');
const { setRoutes } = require('./acceptor');

const globalTokenString = (serverSecrets || {}).gh_token;

let tokenProvider, persistence;
if (globalTokenString) {
  // When a global gh_token is configured, use that in place of our token
  // pool. This produces more predictable behavior, and more predictable
  // failures when that token is exhausted.
  tokenProvider = new StaticTokenProvider(globalTokenString);
  persistence = null;
} else {
  tokenProvider = new PoolingTokenProvider();
  persistence = new TokenPersistence(null, tokenProvider);
}

const githubUri = process.env.GITHUB_URL || 'https://api.github.com';
const githubProvider = new GithubProvider(githubUri, tokenProvider);

module.exports = {
  provider: githubProvider,
  persistence,
  setRoutes: server => setRoutes(tokenProvider, server),
};
