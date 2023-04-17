import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  guild: {
    premium_subscription_count: nonNegativeInteger,
  },
}).required()

const documentation = `
<p>
  The Discord badge requires the <code>SERVER INVITE CODE</code> in order access the Discord JSON API, this invite code should be set to never expire.
</p>
<p>
  The <code>SERVER INVITE CODE</code> can be located at the end of the invite url.
</p>
`

export default class DiscordBoosts extends BaseJsonService {
  static category = 'chat'

  static route = {
    base: 'discord/boosts',
    pattern: ':inviteId',
  }

  static auth = {
    passKey: 'discord_bot_token',
    authorizedOrigins: ['https://discord.com'],
    isRequired: false,
  }

  static examples = [
    {
      title: 'Discord',
      namedParams: { inviteId: 'HjJCwm5' },
      staticPreview: this.render({ boosts: 5 }),
      documentation,
    },
  ]

  static _cacheLength = 30

  static defaultBadgeData = { label: 'chat' }

  static render({ boosts }) {
    return {
      message: `${boosts} boosts`,
      color: 'brightgreen',
    }
  }

  async fetch({ inviteId }) {
    const url = `https://discord.com/api/v9/invites/${inviteId}?with_counts=true`
    return this._requestJson(
      {
        url,
        schema,
        errorMessages: {
          404: 'invalid server invite',
        },
      },
    )
  }

  async handle({ inviteId }) {
    const data = await this.fetch({ inviteId })
    return this.constructor.render({
      boosts: data.guild.premium_subscription_count,
    })
  }
}
