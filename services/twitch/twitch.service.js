'use strict'

const Joi = require('joi')
const TwitchBase = require('./twitch-base')

const helixSchema = Joi.object({
  data: Joi.array().required(),
})

module.exports = class TwitchStatus extends TwitchBase {
  static category = 'activity'

  static route = {
    base: 'twitch/status',
    pattern: ':user',
  }

  static examples = [
    {
      title: 'Twitch Status',
      namedParams: {
        user: 'andyonthewings',
      },
      staticPreview: {
        message: 'live',
        color: 'red',
      },
    },
  ]

  static defaultBadgeData = {
    label: 'twitch',
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
