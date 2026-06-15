import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'

export default class BlueskyFollowers extends BaseJsonService {
  static category = 'social'

  static route = {
    base: 'bluesky/follow',
    pattern: ':handle',
  }

  static openApi = {
    '/bluesky/follow/{handle}': {
      get: {
        summary: 'Bluesky Follow',
        parameters: pathParams({
          name: 'handle',
          example: 'bsky.app',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'follow on bluesky' }

  static render({ followers }) {
    return {
      message: `${followers} followers`,
      color: 'blue',
    }
  }

  async fetch({ handle }) {
    return this._requestJson({
      schema: Joi.object({
        followersCount: Joi.number().required(),
      }).required(),
      url: `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile`,
      options: { searchParams: { actor: handle } },
    })
  }

  async handle({ handle }) {
    const data = await this.fetch({ handle })
    return this.constructor.render({ followers: data.followersCount })
  }
}
