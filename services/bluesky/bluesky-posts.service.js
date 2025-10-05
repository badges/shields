import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  postsCount: nonNegativeInteger,
}).required()

const documentation = `
Displays the number of Bluesky posts for a given handle.
Example: https://img.shields.io/bluesky/posts/chitvs.bsky.social
`

export default class BlueskyPosts extends BaseJsonService {
  static category = 'social'
  static route = { base: 'bluesky/posts', pattern: ':actor' }

  static examples = [
    {
      title: 'Bluesky posts',
      namedParams: { actor: 'chitvs.bsky.social' },
      staticPreview: this.render({ posts: 0 }),
      documentation,
    },
  ]

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
      options: {
        method: 'GET',
        url: 'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile',
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
    return this.constructor.render({ posts: data.postsCount })
  }
}
