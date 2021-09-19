import { AuthHelper } from '../../core/base-service/auth-helper.js'
import RedisTokenPersistence from '../../core/token-pooling/redis-token-persistence.js'
import log from '../../core/server/log.js'
import GithubApiProvider from './github-api-provider.js'
import { setRoutes as setAdminRoutes } from './auth/admin.js'
import { setRoutes as setAcceptorRoutes } from './auth/acceptor.js'

const readPackagesScope = 'read:packages'
// Multiple scopes need to be uri-encoded space delimited
const tokenScopes = `${readPackagesScope}`
const persistenceScopeDelimiter = '.scopes.'

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
    this._tokenScopes = {}
    this._maxNumReservedScopedTokens = 0

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
      tokenScopeNames: {
        readPackages: readPackagesScope,
      },
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

    // Reserve a subset of scoped tokens from the total set
    // to be used for queries which require an explicit scope,
    // while leaving a sufficient amount of tokens (scoped or unscoped)
    // for the bulk of our requests which don't care about scopes.
    this._maxNumReservedScopedTokens = Math.floor(tokens.length * 0.15)
    tokens.forEach(tokenString => {
      const [token, scopes] = tokenString.split(persistenceScopeDelimiter)
      this._tokenScopes[token] = scopes || null
      const data = { scopes }
      const numReserved = this.apiProvider.numReservedScopedTokens()
      if (scopes && numReserved < this._maxNumReservedScopedTokens) {
        this.apiProvider.addReservedScopedToken(token, data)
      } else {
        this.apiProvider.addToken(token, data)
      }
    })

    const { shieldsSecret, apiProvider } = this
    setAdminRoutes({ shieldsSecret }, { apiProvider, server })

    if (this.oauthHelper.isConfigured) {
      setAcceptorRoutes({
        server,
        authHelper: this.oauthHelper,
        tokenScopes,
        onTokenAccepted: tokenString =>
          this.onTokenAdded(tokenString, tokenScopes),
      })
    }
  }

  onTokenAdded(tokenString, tokenScopes) {
    if (!this.persistence) {
      throw Error('Token persistence is not configured')
    }
    const data = { scopes: tokenScopes }
    const numReserved = this.apiProvider.numReservedScopedTokens()
    if (numReserved < this._maxNumReservedScopedTokens) {
      this.apiProvider.addReservedScopedToken(tokenString, data)
    } else {
      this.apiProvider.addToken(tokenString, data)
    }

    process.nextTick(async () => {
      try {
        // To avoid having multiple set entries for re-authorized/re-scoped
        // tokens we need to first remove the previous entry that had different scopes
        if (
          Object.prototype.hasOwnProperty.call(this._tokenScopes, tokenString)
        ) {
          const currentScopes = this._tokenScopes[tokenString]
          // These scopes shouldn't match in practice, as that would
          // indicate the function has somehow been invoked with an existing
          // token but without any scope changes. Nevertheless, the conditional
          // guard is here in case there are circumstances that assumption fails
          // to be upheld.
          if (currentScopes !== tokenScopes) {
            const token = currentScopes
              ? `${tokenString}${persistenceScopeDelimiter}${currentScopes}`
              : tokenString
            await this.persistence.noteTokenRemoved(token)
          }
        }
        // It's unlikely that we'd evert revert back to no longer requesting any scopes
        // but handling that scenario regardless so we don't end up
        // with junk like `abc123.scopes.undefined` in redis
        const token = tokenScopes
          ? `${tokenString}${persistenceScopeDelimiter}${tokenScopes}`
          : tokenString
        await this.persistence.noteTokenAdded(token)
        this._tokenScopes[tokenString] = tokenScopes || null
      } catch (e) {
        log.error(e)
      }
    })
  }

  onTokenInvalidated(tokenString) {
    if (this.persistence) {
      process.nextTick(async () => {
        try {
          const scopes = this._tokenScopes[tokenString]
          const token = scopes
            ? `${tokenString}${persistenceScopeDelimiter}${scopes}`
            : tokenString
          await this.persistence.noteTokenRemoved(token)
          delete this._tokenScopes[tokenString]
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
