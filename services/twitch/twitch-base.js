import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const tokenSchema = Joi.object({
  access_token: Joi.string().required(),
  refresh_token: Joi.string(),
  expires_in: Joi.number(),
  scope: Joi.array(),
  token_type: Joi.string(),
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Abstract class for Twitch badges
export default class TwitchBase extends BaseJsonService {
  static auth = {
    userKey: 'twitch_client_id',
    passKey: 'twitch_client_secret',
    authorizedOrigins: ['https://id.twitch.tv'],
    isRequired: true,
  }

  constructor(...args) {
    super(...args)
    if (!TwitchBase.__twitchToken) {
      TwitchBase.__twitchToken = this._getNewToken()
    }
  }

  async _twitchToken() {
    return TwitchBase.__twitchToken
  }

  async _getNewToken() {
    const tokenRes = await super._requestJson(
      this.authHelper.withQueryStringAuth(
        { userKey: 'client_id', passKey: 'client_secret' },
        {
          schema: tokenSchema,
          url: `https://id.twitch.tv/oauth2/token`,
          options: {
            method: 'POST',
            searchParams: {
              grant_type: 'client_credentials',
            },
          },
          errorMessages: {
            401: 'invalid token',
            404: 'node not found',
          },
        }
      )
    )

    // replace the token when we are 80% near the expire time
    // 2147483647 is the max 32-bit value that is accepted by setTimeout(), it's about 24.9 days
    const replaceTokenMs = Math.min(
      tokenRes.expires_in * 1000 * 0.8,
      2147483647
    )
    const timeout = setTimeout(() => {
      TwitchBase.__twitchToken = this._getNewToken()
    }, replaceTokenMs)

    // do not block program exit
    timeout.unref()

    return tokenRes.access_token
  }

  async _requestJson(request) {
    // assign Client-ID and Authorization headers to request.options.headers if they are not set
    request = {
      ...request,
      options: {
        ...request.options,
        headers: {
          'Client-ID': this.authHelper._user,
          Authorization: `Bearer ${await this._twitchToken()}`,
          ...(request.options && request.options.headers),
        },
      },
    }

    for (let i = 0; i < 3; i++) {
      // 3 trials
      try {
        return await super._requestJson(request)
      } catch (err) {
        // if the token expire or is revoked
        // https://dev.twitch.tv/docs/authentication/#refresh-in-response-to-server-rejection-for-bad-authentication
        if (err.name === 'InvalidResponse' && err.response.statusCode === 401) {
          TwitchBase.__twitchToken = this._getNewToken()
          continue
        }

        // if API limit is exceeded
        // https://dev.twitch.tv/docs/api/guide/#rate-limits
        if (err.name === 'InvalidResponse' && err.response.statusCode === 429) {
          const resetTimestamp = err.response.headers['ratelimit-reset']
          await sleep(Math.abs(resetTimestamp - Date.now()) + 100)
          continue
        }

        // cannot recover
        throw err
      }
    }

    // one last time
    return super._requestJson(request)
  }
}
