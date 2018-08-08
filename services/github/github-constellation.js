'use strict';

const path = require('path');
const githubAuth = require('../../lib/github-auth');
const serverSecrets = require('../../lib/server-secrets');
const log = require('../../lib/log');
const GithubApiProvider = require('./github-api-provider');
const { setRoutes: setAdminRoutes } = require('./auth/admin');

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

    const baseUrl = process.env.GITHUB_URL || 'https://api.github.com';
    this.apiProvider = new GithubApiProvider({ baseUrl });
  }

  scheduleDebugLogging() {
    if (this._debugEnabled) {
      this.debugInterval = setInterval(() => {
        log(githubAuth.serializeDebugInfo());
      }, 1000 * this._debugIntervalSeconds);
    }
  }

  async initialize(server) {
    this.scheduleDebugLogging();

    githubAuth.scheduleAutosaving(this._userTokensPath);
    // TODO Catch errors and send them to Sentry.

    setAdminRoutes(server);

    if (serverSecrets && serverSecrets.gh_client_id) {
      githubAuth.setRoutes(server);
    }
  }

  stop() {
    githubAuth.cancelAutosaving();
    if (this.debugInterval) {
      clearInterval(this.debugInterval);
      this.debugInterval = undefined;
    }
  }
}

module.exports = GithubConstellation;
