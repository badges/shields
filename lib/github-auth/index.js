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
const { setRoutes: setAcceptorRoutes } = require('./acceptor');

const globalTokenString = (serverSecrets || {}).gh_token;

let persistence, debugInterval, defaultProvider;

function initialize(config, server) {
  if (config.debug.enabled) {
    githubDebugInterval = setInterval(() => {
      log(githubAuth.getTokenDebugInfo());
    }, 1000 * config.services.github.debug.intervalSeconds);
  }

  let tokenProvider;
  if (globalTokenString) {
    // When a global gh_token is configured, use that in place of our token
    // pool. This produces more predictable behavior, and more predictable
    // failures when that token is exhausted.
    tokenProvider = new StaticTokenProvider(globalTokenString);
  } else {
    tokenProvider = new PoolingTokenProvider();
    persistence = new TokenPersistence(tokenProvider, './private/github-user-tokens.json');
    persistence.initialize().catch(e => {
      // TODO Send this to sentry instead of crashing.
      console.error(e);
      process.exit(1);
    });
  }

  setAdminRoutes(tokenProvider, server);

  if (serverSecrets && serverSecrets.gh_client_id) {
    setAcceptorRoutes(server);
  }

  const githubUri = process.env.GITHUB_URL || 'https://api.github.com';
  defaultProvider = new GithubProvider(githubUri, tokenProvider);
  return defaultProvider;
}

function getDefaultProvider() {
  return defaultProvider;
}

function stop() {
  if (persistence) {
    persistence.stop();
  }
  if (githubDebugInterval) {
    clearInterval(githubDebugInterval);
    githubDebugInterval = undefined;
  }
}

module.exports = {
  initialize,
  getDefaultProvider,
  stop,
};
