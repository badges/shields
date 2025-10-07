import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  postsCount: nonNegativeInteger,
}).required()

export default class BlueskyPosts extends BaseJsonService {
  static category = 'social'
  static route = { base: 'bluesky/posts', pattern: ':actor' }

  static openApi = {
    '/bluesky/posts/{actor}': {
      get: {
        summary: 'Bluesky posts',
        description:
          'Displays the number of Bluesky posts for a given handle using the public Bluesky API.',
        parameters: pathParams({
          name: 'actor',
          description: 'Bluesky handle (user ID)',
          example: 'chitvs.bsky.social',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'posts', namedLogo: 'bluesky' }

  static render({ posts }) {
    return {
      message: metric(posts),
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
        400: 'user not found',
      },
    })
  }

  async handle({ actor }) {
    const data = await this.fetch({ actor })
    return this.constructor.render({ posts: data.postsCount })
  }
}
