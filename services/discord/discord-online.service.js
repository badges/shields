import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'

// https://discord.com/developers/docs/resources/invite#get-invite
const schema = Joi.object({
  approximate_presence_count: nonNegativeInteger,
  approximate_member_count: nonNegativeInteger,
}).required()

const description = `
<p>
  This badge shows the approximate number of members currently online and the approximate total membership, for example <code>55/665 online</code>.
</p>

<p>
  It uses a <a href="https://discord.com/developers/docs/resources/invite#get-invite">server invite code</a>, which is the last part of an invite link.
  For <code>https://discord.gg/HjJCwm5</code> the invite code is <code>HjJCwm5</code>.
  Create an invite that does not expire. Expired invites, invites that have reached their use limit, and group DM invites will not work.
  The server widget does not need to be enabled.
</p>

<p>
  Discord returns approximate counts. They can differ slightly from the member list in the Discord app and from the server ID badge, which uses the widget API and shows only who is online.
</p>
`

export default class DiscordOnline extends BaseJsonService {
  static category = 'chat'

  static route = {
    base: 'discord/online',
    pattern: ':inviteCode',
  }

  static auth = {
    passKey: 'discord_bot_token',
    authorizedOrigins: ['https://discord.com'],
    isRequired: false,
  }

  static openApi = {
    '/discord/online/{inviteCode}': {
      get: {
        summary: 'Discord Online',
        description,
        parameters: pathParams({
          name: 'inviteCode',
          example: 'HjJCwm5',
          description:
            'Permanent server invite code, for example <code>HjJCwm5</code> from <code>https://discord.gg/HjJCwm5</code>',
        }),
      },
    },
  }

  // Discord caches these approximate counts for about five minutes.
  static _cacheLength = 300

  static defaultBadgeData = { label: 'chat' }

  static render({ online, members }) {
    return {
      message: `${metric(online)}/${metric(members)} online`,
      color: 'brightgreen',
    }
  }

  async fetch({ inviteCode }) {
    return this._requestJson(
      this.authHelper.withBearerAuthHeader(
        {
          schema,
          url: `https://discord.com/api/v10/invites/${encodeURIComponent(inviteCode)}`,
          options: {
            searchParams: { with_counts: 'true' },
          },
          httpErrors: {
            404: 'invalid invite',
          },
        },
        'Bot',
      ),
    )
  }

  async handle({ inviteCode }) {
    const data = await this.fetch({ inviteCode })
    return this.constructor.render({
      online: data.approximate_presence_count,
      members: data.approximate_member_count,
    })
  }
}
