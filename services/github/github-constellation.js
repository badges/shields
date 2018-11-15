'use strict'

const path = require('path')
const serverSecrets = require('../../lib/server-secrets')
const log = require('../../lib/log')
const RedisTokenPersistence = require('../../lib/redis-token-persistence')
const FsTokenPersistence = require('../../lib/fs-token-persistence')
const {
  StaticTokenProvider,
  PoolingTokenProvider,
} = require('./token-provider')
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

    const globalTokenString = (serverSecrets || {}).gh_token

    if (globalTokenString) {
      // When a global gh_token is configured, use that in place of our token
      // pool. This produces more predictable behavior, and more predictable
      // failures when that token is exhausted.
      this.usingPooling = false
      this.coreTokenProvider = this.searchTokenProvider = new StaticTokenProvider(
        globalTokenString
      )
    } else {
      this.usingPooling = true
      this.coreTokenProvider = new PoolingTokenProvider()
      this.searchTokenProvider = new PoolingTokenProvider()
    }

    const baseUrl = process.env.GITHUB_URL || 'https://api.github.com'
    const { coreTokenProvider } = this
    this.apiProvider = new GithubApiProvider({ baseUrl, coreTokenProvider })
  }

  scheduleDebugLogging() {
    if (this._debugEnabled) {
      this.debugInterval = setInterval(() => {
        if (this.coreTokenProvider) {
          log('coreTokenProvider', this.coreTokenProvider.getTokenDebugInfo())
        }
        if (this.searchTokenProvider) {
          log(
            'searchTokenProvider',
            this.searchTokenProvider.getTokenDebugInfo()
          )
        }
      }, 1000 * this._debugIntervalSeconds)
    }
  }

  async initialize(server) {
    this.scheduleDebugLogging()

    if (this.usingPooling) {
      this.persistence = new TokenPersistence(
        this.coreTokenProvider,
        this._userTokensPath
      )
      await this.persistence.initialize()
      this.coreTokenProvider
        .toNative()
        .forEach(t => this.searchTokenProvider.addToken(t))
    }
    // TODO Catch errors and send them to Sentry.

    githubAuth.emitter.on('token-added', this.persistence.noteTokenAdded)
    githubAuth.emitter.on('token-removed', this.persistence.noteTokenRemoved)

    setAdminRoutes(this.coreTokenProvider, server)

    if (serverSecrets && serverSecrets.gh_client_id) {
      setAcceptorRoutes(this.coreTokenProvider, server)
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

    try {
      await this.persistence.stop()
    } catch (e) {
      log.error(e)
    }
  }
}

module.exports = GithubConstellation
