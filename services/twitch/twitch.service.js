import Joi from 'joi'
import TwitchBase from './twitch-base.js'

const helixSchema = Joi.object({
  data: Joi.array().required(),
})

export default class TwitchStatus extends TwitchBase {
  static category = 'social'

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
      queryParams: { style: 'social' },
      staticPreview: {
        message: 'live',
        color: 'red',
        style: 'social',
      },
    },
  ]

  static _cacheLength = 30

  static defaultBadgeData = {
    label: 'twitch',
    namedLogo: 'twitch',
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
        searchParams: { user_login: user },
      },
    })

    return streams
  }

  async handle({ user }) {
    const data = await this.fetch({ user })
    return this.constructor.render({ user, isLive: data.data.length > 0 })
  }
}
