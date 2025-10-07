import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  followersCount: nonNegativeInteger,
}).required()

export default class BlueskyFollowers extends BaseJsonService {
  static category = 'social'
  static route = { base: 'bluesky/followers', pattern: ':actor' }

  static openApi = {
    '/bluesky/followers/{actor}': {
      get: {
        summary: 'Bluesky followers',
        description:
          'Displays the number of Bluesky followers for a given handle using the public Bluesky API.',
        parameters: pathParams({
          name: 'actor',
          description: 'Bluesky handle (user ID)',
          example: 'chitvs.bsky.social',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'followers', namedLogo: 'bluesky' }

  static render({ followers }) {
    return {
      message: metric(followers),
      color: 'blue',
      style: 'social',
    }
  }

  async fetch({ actor }) {
    return this._requestJson({
      schema,
      url: 'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile',
      options: {
        searchParams: { actor },
      },
      httpErrors: {
        400: 'invalid',
        404: 'user not found',
      },
    })
  }

  async handle({ actor }) {
    const data = await this.fetch({ actor })
    return this.constructor.render({ followers: data.followersCount })
  }
}
