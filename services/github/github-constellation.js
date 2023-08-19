import { AuthHelper } from '../../core/base-service/auth-helper.js'
import SqlTokenPersistence from '../../core/token-pooling/sql-token-persistence.js'
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
      config,
    )
  }

  constructor(config) {
    this._debugEnabled = config.service.debug.enabled
    this._debugIntervalSeconds = config.service.debug.intervalSeconds

    let authType = GithubApiProvider.AUTH_TYPES.NO_AUTH

    const { postgres_url: pgUrl, gh_token: globalToken } = config.private
    if (pgUrl) {
      log.log('Github Token persistence configured with pgUrl')
      this.persistence = new SqlTokenPersistence({
        url: pgUrl,
        table: 'github_user_tokens',
      })
      authType = GithubApiProvider.AUTH_TYPES.TOKEN_POOL
    }

    if (globalToken) {
      authType = GithubApiProvider.AUTH_TYPES.GLOBAL_TOKEN
    }

    log.log(`Github using auth type: ${authType}`)

    this.apiProvider = new GithubApiProvider({
      baseUrl: config.service.baseUri,
      globalToken,
      authType,
      onTokenInvalidated: tokenString => this.onTokenInvalidated(tokenString),
      restApiVersion: config.service.restApiVersion,
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
    if (this.apiProvider.authType !== GithubApiProvider.AUTH_TYPES.TOKEN_POOL) {
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
