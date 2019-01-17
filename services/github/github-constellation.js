'use strict'

const path = require('path')
const RedisTokenPersistence = require('../../core/token-pooling/redis-token-persistence')
const FsTokenPersistence = require('../../core/token-pooling/fs-token-persistence')
const serverSecrets = require('../../lib/server-secrets')
const log = require('../../core/server/log')
const GithubApiProvider = require('./github-api-provider')
const { setRoutes: setAdminRoutes } = require('./auth/admin')
const { setRoutes: setAcceptorRoutes } = require('./auth/acceptor')

// Convenience class with all the stuff related to the Github API and its
// authorization tokens, to simplify server initialization.
class GithubConstellation {
  constructor(config) {
    this._debugEnabled = config.service.debug.enabled
    this._debugIntervalSeconds = config.service.debug.intervalSeconds

    const { redisUrl, dir: persistenceDir } = config.persistence
    if (config.persistence.redisUrl) {
      log(`RedisTokenPersistence configured with ${redisUrl}`)
      this.persistence = new RedisTokenPersistence({
        url: redisUrl,
        key: 'githubUserTokens',
      })
    } else {
      const userTokensPath = path.resolve(
        persistenceDir,
        'github-user-tokens.json'
      )
      log(`FsTokenPersistence configured with ${userTokensPath}`)
      this.persistence = new FsTokenPersistence({ path: userTokensPath })
    }

    const globalToken = serverSecrets.gh_token
    const baseUrl = process.env.GITHUB_URL || 'https://api.github.com'
    this.apiProvider = new GithubApiProvider({
      baseUrl,
      globalToken,
      withPooling: !globalToken,
      onTokenInvalidated: tokenString => this.onTokenInvalidated(tokenString),
    })
  }

  scheduleDebugLogging() {
    if (this._debugEnabled) {
      this.debugInterval = setInterval(() => {
        log(this.apiProvider.getTokenDebugInfo())
      }, 1000 * this._debugIntervalSeconds)
    }
  }

  async initialize(server) {
    if (!this.apiProvider.withPooling) {
      return
    }

    this.scheduleDebugLogging()

    let tokens = []
    try {
      tokens = await this.persistence.initialize()
    } catch (e) {
      log.error(e)
    }

    tokens.forEach(tokenString => {
      this.apiProvider.addToken(tokenString)
    })

    setAdminRoutes(this.apiProvider, server)

    if (serverSecrets.gh_client_id && serverSecrets.gh_client_secret) {
      setAcceptorRoutes({
        server,
        onTokenAccepted: tokenString => this.onTokenAdded(tokenString),
      })
    }
  }

  onTokenAdded(tokenString) {
    this.apiProvider.addToken(tokenString)
    process.nextTick(async () => {
      try {
        await this.persistence.noteTokenAdded(tokenString)
      } catch (e) {
        log.error(e)
      }
    })
  }

  onTokenInvalidated(tokenString) {
    process.nextTick(async () => {
      try {
        await this.persistence.noteTokenRemoved(tokenString)
      } catch (e) {
        log.error(e)
      }
    })
  }

  async stop() {
    if (this.debugInterval) {
      clearInterval(this.debugInterval)
      this.debugInterval = undefined
    }

    try {
      await this.persistence.stop()
    } catch (e) {
      log.error(e)
    }
  }
}

module.exports = GithubConstellation
