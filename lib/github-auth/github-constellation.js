'use strict';

const path = require('path');
const serverSecrets = require('../server-secrets');
const log = require('../log');
const {
  StaticTokenProvider,
  PoolingTokenProvider,
} = require('./token-provider');
const TokenPersistence = require('./token-persistence');
const GithubApiProvider = require('./github-api-provider');
const { setRoutes: setAcceptorRoutes } = require('./acceptor');
const { setRoutes: setAdminRoutes } = require('./admin');

// Convenience class with all the stuff related to the Github API and its
// authorization tokens, to simplify server initialization.
class GithubConstellation {
  constructor(config) {
    this._debugEnabled = config.service.debug.enabled;
    this._debugIntervalSeconds = config.service.debug.intervalSeconds;
    this._userTokensPath = path.resolve(
      config.persistence.dir,
      'github-user-tokens.json'
    );

    const globalTokenString = (serverSecrets || {}).gh_token;

    if (globalTokenString) {
      // When a global gh_token is configured, use that in place of our token
      // pool. This produces more predictable behavior, and more predictable
      // failures when that token is exhausted.
      this.usingPooling = false;
      this.coreTokenProvider = this.searchTokenProvider = new StaticTokenProvider(
        globalTokenString
      );
    } else {
      this.usingPooling = true;
      this.coreTokenProvider = new PoolingTokenProvider();
      this.searchTokenProvider = new PoolingTokenProvider();
    }

    const githubUrl = process.env.GITHUB_URL || 'https://api.github.com';
    this.apiProvider = new GithubApiProvider(githubUrl, this.coreTokenProvider);
  }

  scheduleDebugLogging() {
    if (this._debugEnabled) {
      this.debugInterval = setInterval(() => {
        if (this.coreTokenProvider) {
          log('coreTokenProvider', this.coreTokenProvider.getTokenDebugInfo());
        }
        if (this.searchTokenProvider) {
          log(
            'searchTokenProvider',
            this.searchTokenProvider.getTokenDebugInfo()
          );
        }
      }, 1000 * this._debugIntervalSeconds);
    }
  }

  async initialize(server) {
    this.scheduleDebugLogging();

    if (this.usingPooling) {
      this.persistence = new TokenPersistence(
        this.coreTokenProvider,
        this._userTokensPath
      );
      await this.persistence.initialize();
      this.coreTokenProvider
        .toNative()
        .forEach(t => this.searchTokenProvider.addToken(t));
    }
    // TODO Catch errors and send them to Sentry.

    setAdminRoutes(this.coreTokenProvider, server);

    if (serverSecrets && serverSecrets.gh_client_id) {
      setAcceptorRoutes(this.coreTokenProvider, server);
    }
  }

  stop() {
    if (this.persistence) {
      this.persistence.stop();
    }
    if (this.debugInterval) {
      clearInterval(this.debugInterval);
      this.debugInterval = undefined;
    }
  }
}

module.exports = GithubConstellation;
