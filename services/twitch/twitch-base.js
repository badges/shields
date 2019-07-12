'use strict'

const Joi = require('@hapi/joi')
const serverSecrets = require('../../lib/server-secrets')
const { BaseJsonService } = require('..')

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
module.exports = class TwitchBase extends BaseJsonService {
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
    const tokenRes = await super._requestJson({
      schema: tokenSchema,
      url: `https://id.twitch.tv/oauth2/token`,
      options: {
        method: 'POST',
        qs: {
          client_id: serverSecrets.twitch_client_id,
          client_secret: serverSecrets.twitch_client_secret,
          grant_type: 'client_credentials',
        },
      },
    })
    return tokenRes.access_token
  }

  async _requestJson(request) {
    // assign Client-ID and Authorization headers to request.options.headers if they are not set
    request = {
      ...request,
      options: {
        ...request.options,
        headers: {
          'Client-ID': serverSecrets.twitch_client_id,
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
