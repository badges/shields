import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService, pathParams } from '../index.js'

const npubSchema = Joi.object({
  followers_pubkey_count: Joi.number().required(),
}).required()

const mainSchema = Joi.object({
  stats: Joi.object()
    .pattern(Joi.string(), npubSchema)
    .min(1)
    .max(1)
    .required(),
}).required()

export default class NostrBandFollowers extends BaseJsonService {
  static category = 'social'

  static route = {
    base: 'nostr-band/followers',
    pattern: ':npub',
  }

  static openApi = {
    '/nostr-band/followers/{npub}': {
      get: {
        summary: 'Nostr.band Followers',
        description:
          'Returns the number of followers for a Nostr pubkey using the Nostr.band API.',
        parameters: pathParams({
          name: 'npub',
          description: 'Nostr pubkey in (npub1...) format or hex.',
          example:
            'npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'followers' }

  static render({ followers }) {
    return {
      message: metric(followers),
      style: 'social',
    }
  }

  async fetch({ npub }) {
    const data = await this._requestJson({
      url: `https://api.nostr.band/v0/stats/profile/${npub}`,
      schema: mainSchema,
      httpErrors: {
        400: 'invalid pubkey',
      },
    })
    const stats = data.stats
    const firstKey = Object.keys(stats)[0]
    return stats[firstKey].followers_pubkey_count
  }

  async handle({ npub }) {
    const followers = await this.fetch({ npub })
    return this.constructor.render({ followers })
  }
}
