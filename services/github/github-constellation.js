import { AuthHelper } from '../../core/base-service/auth-helper.js'
import RedisTokenPersistence from '../../core/token-pooling/redis-token-persistence.js'
import log from '../../core/server/log.js'
import GithubApiProvider from './github-api-provider.js'
import { setRoutes as setAcceptorRoutes } from './auth/acceptor.js'

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

    const { redis_url: redisUrl, gh_token: globalToken } = config.private
    if (redisUrl) {
      log.log('Token persistence configured with redisUrl')
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
        log.log(this.apiProvider.getTokenDebugInfo())
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

export default GithubConstellation
