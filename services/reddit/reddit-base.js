import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const tokenSchema = Joi.object({
  access_token: Joi.string().required(),
  expires_in: Joi.number(),
})

// Abstract class for Reddit badges
// Authorization flow based on https://github.com/reddit-archive/reddit/wiki/OAuth2#application-only-oauth.
export default class RedditBase extends BaseJsonService {
  static category = 'social'

  static auth = {
    userKey: 'reddit_client_id',
    passKey: 'reddit_client_secret',
    authorizedOrigins: ['https://www.reddit.com'],
    isRequired: false,
  }

  constructor(...args) {
    super(...args)
    if (!RedditBase._redditToken && this.authHelper.isConfigured) {
      RedditBase._redditToken = this._getNewToken()
    }
  }

  async _getNewToken() {
    const tokenRes = await super._requestJson(
      this.authHelper.withBasicAuth({
        schema: tokenSchema,
        url: 'https://www.reddit.com/api/v1/access_token',
        options: {
          method: 'POST',
          body: 'grant_type=client_credentials',
        },
        httpErrors: {
          401: 'invalid token',
        },
      }),
    )

    // replace the token when we are 80% near the expire time
    // 2147483647 is the max 32-bit value that is accepted by setTimeout(), it's about 24.9 days
    const replaceTokenMs = Math.min(
      tokenRes.expires_in * 1000 * 0.8,
      2147483647,
    )
    const timeout = setTimeout(() => {
      RedditBase._redditToken = this._getNewToken()
    }, replaceTokenMs)

    // do not block program exit
    timeout.unref()

    return tokenRes.access_token
  }

  async _requestJson(request) {
    if (!this.authHelper.isConfigured) {
      return super._requestJson(request)
    }

    request = await this.addBearerAuthHeader(request)
    try {
      return await super._requestJson(request)
    } catch (err) {
      if (err.response && err.response.statusCode === 401) {
        // if the token is expired or has been revoked, retry once
        RedditBase._redditToken = this._getNewToken()
        request = await this.addBearerAuthHeader(request)
        return super._requestJson(request)
      }
      // cannot recover
      throw err
    }
  }

  async addBearerAuthHeader(request) {
    return {
      ...request,
      options: {
        headers: {
          Authorization: `Bearer ${await RedditBase._redditToken}`,
        },
      },
    }
  }
}
