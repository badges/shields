import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  followersCount: nonNegativeInteger,
}).required()

const documentation = `
Displays the number of Bluesky followers for a given handle.
`

export default class BlueskyFollowers extends BaseJsonService {
  static category = 'social'
  static route = { base: 'bluesky/followers', pattern: ':actor' }

  static examples = [
    {
      title: 'Bluesky followers',
      namedParams: { actor: 'chitvs.bsky.social' },
      staticPreview: this.render({ followers: 123 }),
      documentation,
    },
  ]

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
    return this.constructor.render({ followers: data.followersCount })
  }
}
