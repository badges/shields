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

// Abstract class for Twitch badges
module.exports = class TwitchBase extends BaseJsonService {
  async _twitchToken() {
    if (!TwitchBase.__twitchToken) {
      await this._getNewToken()
    }
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
    TwitchBase.__twitchToken = tokenRes.access_token
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

    try {
      return await super._requestJson(request)
    } catch (err) {
      // if API limit is exceeded
      // https://dev.twitch.tv/docs/api/guide/#rate-limits
      if (err.name === 'InvalidResponse' && err.response.statusCode === 429) {
        await this._getNewToken()
        return super._requestJson(request)
      }

      // cannot recover
      throw err
    }
  }
}
