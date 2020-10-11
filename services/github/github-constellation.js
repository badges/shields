'use strict'

const { AuthHelper } = require('../../core/base-service/auth-helper')
const RedisTokenPersistence = require('../../core/token-pooling/redis-token-persistence')
const log = require('../../core/server/log')
const GithubApiProvider = require('./github-api-provider')
const { setRoutes: setAdminRoutes } = require('./auth/admin')
const { setRoutes: setAcceptorRoutes } = require('./auth/acceptor')

// Convenience class with all the stuff related to the Github API and its
// authorization tokens, to simplify server initialization.
class GithubConstellation {
  static _createOauthHelper(config) {
    return new AuthHelper(
      {
        userKey: 'gh_client_id',
        passKey: 'gh_client_secret',
        authorizedOrigins: ['https://api.github.com'],
        isRequired: true,
      },
      config
    )
  }

  constructor(config) {
    this._debugEnabled = config.service.debug.enabled
    this._debugIntervalSeconds = config.service.debug.intervalSeconds
    this.shieldsSecret = config.private.shields_secret

    const { redis_url: redisUrl, gh_token: globalToken } = config.private
    if (redisUrl) {
      log('Token persistence configured with redisUrl')
      this.persistence = new RedisTokenPersistence({
        url: redisUrl,
        key: 'githubUserTokens',
      })
    }

    this.apiProvider = new GithubApiProvider({
      baseUrl: process.env.GITHUB_URL || 'https://api.github.com',
      globalToken,
      withPooling: !globalToken,
      onTokenInvalidated: tokenString => this.onTokenInvalidated(tokenString),
    })

    this.oauthHelper = this.constructor._createOauthHelper(config)
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

    if (!this.persistence) {
      return
    }

    let tokens = []
    try {
      tokens = await this.persistence.initialize()
    } catch (e) {
      log.error(e)
    }

    tokens.forEach(tokenString => {
      this.apiProvider.addToken(tokenString)
    })

    const { shieldsSecret, apiProvider } = this
    setAdminRoutes({ shieldsSecret }, { apiProvider, server })

    if (this.oauthHelper.isConfigured) {
      setAcceptorRoutes({
        server,
        authHelper: this.oauthHelper,
        onTokenAccepted: tokenString => this.onTokenAdded(tokenString),
      })
    }
  }

  onTokenAdded(tokenString) {
    if (!this.persistence) {
      throw Error('Token persistence is not configured')
    }
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
    if (this.persistence) {
      process.nextTick(async () => {
        try {
          await this.persistence.noteTokenRemoved(tokenString)
        } catch (e) {
          log.error(e)
        }
      })
    }
  }

  async stop() {
    if (this.debugInterval) {
      clearInterval(this.debugInterval)
      this.debugInterval = undefined
    }

    if (this.persistence) {
      try {
        await this.persistence.stop()
      } catch (e) {
        log.error(e)
      }
    }
  }
}

module.exports = GithubConstellation
