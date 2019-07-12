'use strict'

const Joi = require('@hapi/joi')
const TwitchBase = require('./twitch-base')
const { NotFound } = require('..')

const helixSchema = Joi.object({
  data: Joi.array().required(),
})

class TwitchStatus extends TwitchBase {
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
    // If `user` does not exist on Twitch,
    // https://api.twitch.tv/helix/streams returns an empty array,
    // which is the same as when a user is offline.
    // So we check for whether a user exists first and give proper error
    // message if needed.
    const users = this._requestJson({
      schema: helixSchema,
      url: `https://api.twitch.tv/helix/users`,
      options: {
        qs: { login: user },
      },
    })
    const streams = this._requestJson({
      schema: helixSchema,
      url: `https://api.twitch.tv/helix/streams`,
      options: {
        qs: { user_login: user },
      },
    })
    if ((await users).data.length < 1) {
      throw new NotFound({ prettyMessage: 'invalid user' })
    }

    return streams
  }

  async handle({ user }) {
    const data = await this.fetch({ user })
    return this.constructor.render({ user, isLive: data.data.length > 0 })
  }
}

module.exports = [TwitchStatus]
