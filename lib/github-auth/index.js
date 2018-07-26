'use strict';

// Convenience module for the server and other badge provider modules. This
// will be replaced with a dependency-injected version when the badge code is
// updated.
//
// Export a default provider and other convenience properties.

const path = require('path');
const serverSecrets = require('../server-secrets');
const log = require('../log');
const {
  StaticTokenProvider,
  PoolingTokenProvider,
} = require('./token-provider');
const TokenPersistence = require('./token-persistence');
const GithubProvider = require('./github-provider');
const { setRoutes: setAcceptorRoutes } = require('./acceptor');
const { setRoutes: setAdminRoutes } = require('./admin');

const globalTokenString = (serverSecrets || {}).gh_token;

let persistence, debugInterval, defaultProvider;

function initialize(config, server) {
  const debugEnabled = config.service.debug.enabled;
  const debugIntervalSeconds = config.service.debug.intervalSeconds;
  const persistenceDir = config.persistence.dir;

  let tokenProvider;
  if (globalTokenString) {
    // When a global gh_token is configured, use that in place of our token
    // pool. This produces more predictable behavior, and more predictable
    // failures when that token is exhausted.
    tokenProvider = new StaticTokenProvider(globalTokenString);
  } else {
    tokenProvider = new PoolingTokenProvider();
    const userTokensFile = path.resolve(persistenceDir, 'github-user-tokens.json');
    persistence = new TokenPersistence(tokenProvider, userTokensFile);
    persistence.initialize().catch(e => {
      // TODO Send this to sentry instead of crashing.
      console.error(e);
      process.exit(1);
    });
  }

  if (debugEnabled) {
    debugInterval = setInterval(() => {
      log(tokenProvider.getTokenDebugInfo());
    }, 1000 * debugIntervalSeconds);
  }

  const githubUri = process.env.GITHUB_URL || 'https://api.github.com';
  defaultProvider = new GithubProvider(githubUri, tokenProvider);

  setAdminRoutes(tokenProvider, server);

  if (serverSecrets && serverSecrets.gh_client_id) {
    setAcceptorRoutes(server);
  }

  return defaultProvider;
}

function getDefaultProvider() {
  return defaultProvider;
}

function stop() {
  if (persistence) {
    persistence.stop();
  }
  if (debugInterval) {
    clearInterval(debugInterval);
    debugInterval = undefined;
  }
}

module.exports = {
  initialize,
  getDefaultProvider,
  stop,
};
