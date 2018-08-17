'use strict'

const path = require('path')
const githubAuth = require('../../lib/github-auth')
const serverSecrets = require('../../lib/server-secrets')
const log = require('../../lib/log')
const FsTokenPersistence = require('../../lib/fs-token-persistence')
const GithubApiProvider = require('./github-api-provider')
const { setRoutes: setAdminRoutes } = require('./auth/admin')

// Convenience class with all the stuff related to the Github API and its
// authorization tokens, to simplify server initialization.
class GithubConstellation {
  constructor(config) {
    this._debugEnabled = config.service.debug.enabled
    this._debugIntervalSeconds = config.service.debug.intervalSeconds

    const userTokensPath = path.resolve(
      config.persistence.dir,
      'github-user-tokens.json'
    )
    this.persistence = new FsTokenPersistence({ path: userTokensPath })

    const baseUrl = process.env.GITHUB_URL || 'https://api.github.com'
    this.apiProvider = new GithubApiProvider({ baseUrl })
  }

  scheduleDebugLogging() {
    if (this._debugEnabled) {
      this.debugInterval = setInterval(() => {
        log(githubAuth.serializeDebugInfo())
      }, 1000 * this._debugIntervalSeconds)
    }
  }

  async initialize(server) {
    this.scheduleDebugLogging()

    try {
      await this.persistence.initialize()
    } catch (e) {
      log.error(e)
    }

    githubAuth.emitter.on('token-added', this.persistence.noteTokenAdded)
    githubAuth.emitter.on('token-removed', this.persistence.noteTokenRemoved)

    setAdminRoutes(server)

    if (serverSecrets && serverSecrets.gh_client_id) {
      githubAuth.setRoutes(server)
    }
  }

  async stop() {
    if (this.debugInterval) {
      clearInterval(this.debugInterval)
      this.debugInterval = undefined
    }

    githubAuth.emitter.removeListener(
      'token-added',
      this.persistence.noteTokenAdded
    )
    githubAuth.emitter.removeListener(
      'token-removed',
      this.persistence.noteTokenRemoved
    )

    await this.persistence.stop()
  }
}

module.exports = GithubConstellation
