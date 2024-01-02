import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService } from '../index.js'

const npubSchema = Joi.object({
  followers_pubkey_count: Joi.number().required(),
}).required()

const mainSchema = Joi.object({
  stats: Joi.object().pattern(Joi.string(), npubSchema).required(),
}).required()

export default class Nostr extends BaseJsonService {
  static category = 'social'

  static route = {
    base: 'nostr/followers',
    pattern: ':npub',
  }

  static examples = [
    {
      title: 'Nostr Followers',
      namedParams: {
        npub: 'npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7',
      },
      staticPreview: this.render({ followers: 720 }),
    },
  ]

  static defaultBadgeData = { label: 'followers', namedLogo: 'nostr' }

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
      errorMessages: {
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
