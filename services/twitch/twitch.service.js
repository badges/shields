'use strict'

const Joi = require('@hapi/joi')
const serverSecrets = require('../../lib/server-secrets')
const { BaseJsonService, NotFound } = require('..')

const schema = Joi.any()

class TwitchStatus extends BaseJsonService {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'twitch/status',
      pattern: ':user',
    }
  }

  static get examples() {
    const preview = this.render({
      user: 'andyonthewings',
      isLive: true,
    })
    // link[] is not allowed in examples
    delete preview.link
    return [
      {
        title: 'Twitch Status',
        namedParams: {
          user: 'andyonthewings',
        },
        staticPreview: preview,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'twitch',
    }
  }

  static render({ user, isLive }) {
    return {
      message: isLive ? 'live' : 'offline',
      color: isLive ? 'red' : 'lightgrey',
      link: `https://www.twitch.tv/${user}`,
    }
  }

  async fetch({ user }) {
    const headers = { 'Client-ID': serverSecrets.twitch_client_id }

    // If `user` does not exist on Twitch,
    // https://api.twitch.tv/helix/streams returns an empty array,
    // which is the same as when a user is offline.
    // So we check for whether a user exists first and give proper error
    // message if needed.
    const users = await this._requestJson({
      schema,
      url: `https://api.twitch.tv/helix/users`,
      options: {
        headers,
        qs: { login: user },
      },
    })
    if (users.data.length < 1) {
      throw new NotFound({ prettyMessage: 'invalid user' })
    }

    return this._requestJson({
      schema,
      url: `https://api.twitch.tv/helix/streams`,
      options: {
        headers,
        qs: { user_login: user },
      },
    })
  }

  async handle({ user }) {
    const data = await this.fetch({ user })
    return this.constructor.render({ user, isLive: data.data.length > 0 })
  }
}

module.exports = [TwitchStatus]
