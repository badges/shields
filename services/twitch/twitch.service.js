'use strict'

const Joi = require('@hapi/joi')
const TwitchBase = require('./twitch-base')

const helixSchema = Joi.object({
  data: Joi.array().required(),
})

module.exports = class TwitchStatus extends TwitchBase {
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
    // Checking for whether a user exists needs another API call,
    // which we consider not worth it.
    const streams = this._requestJson({
      schema: helixSchema,
      url: `https://api.twitch.tv/helix/streams`,
      options: {
        qs: { user_login: user },
      },
    })

    return streams
  }

  async handle({ user }) {
    const data = await this.fetch({ user })
    return this.constructor.render({ user, isLive: data.data.length > 0 })
  }
}
