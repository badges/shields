'use strict';

// Convenience module for the server and other badge provider modules. This
// will be replaced with a dependency-injected version when the badge code is
// updated.
//
// Export a default provider and other convenience properties.

const serverSecrets = require('../server-secrets');
const {
  StaticTokenProvider,
  PoolingTokenProvider,
} = require('./token-provider');
const TokenPersistence = require('./token-persistence');
const GithubProvider = require('./github-provider');
const { setRoutes } = require('./acceptor');

const globalTokenString = (serverSecrets || {}).gh_token;

let tokenProvider, persistence;
if (globalTokenString) {
  // When a global gh_token is configured, use that in place of our token
  // pool. This produces more predictable behavior, and more predictable
  // failures when that token is exhausted.
  tokenProvider = new StaticTokenProvider(globalTokenString);
} else {
  tokenProvider = new PoolingTokenProvider();
  persistence = new TokenPersistence(tokenProvider, './private/github-user-tokens.json');
}

const githubUri = process.env.GITHUB_URL || 'https://api.github.com';
const defaultProvider = new GithubProvider(githubUri, tokenProvider);

module.exports = {
  defaultProvider,
  persistence,
  setRoutes: server => setRoutes(tokenProvider, server),
};
