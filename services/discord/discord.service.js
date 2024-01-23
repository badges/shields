import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  presence_count: nonNegativeInteger,
}).required()

const description = `
<p>
  The Discord badge requires the <code>SERVER ID</code> in order access the Discord JSON API.
</p>
<p>
  The <code>SERVER ID</code> can be located in the url of the channel that the badge is accessing.
</p>
<img
  src="https://user-images.githubusercontent.com/6025893/39329897-b08f8290-4997-11e8-8f8f-7b85ff61882f.png"
  alt="SERVER ID is after the channel part at the end of the url" />
<p>
  To use the Discord badge a Discord server admin must enable the widget setting on the server.
</p>
<iframe src="https://player.vimeo.com/video/364220040" width="640" height="210" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
`

export default class Discord extends BaseJsonService {
  static category = 'chat'

  static route = {
    base: 'discord',
    pattern: ':serverId',
  }

  static auth = {
    passKey: 'discord_bot_token',
    authorizedOrigins: ['https://discord.com'],
    isRequired: false,
  }

  static openApi = {
    '/discord/{serverId}': {
      get: {
        summary: 'Discord',
        description,
        parameters: pathParams({
          name: 'serverId',
          example: '102860784329052160',
        }),
      },
    },
  }

  static _cacheLength = 300

  static defaultBadgeData = { label: 'chat' }

  static render({ members }) {
    return {
      message: `${members} online`,
      color: 'brightgreen',
    }
  }

  async fetch({ serverId }) {
    const url = `https://discord.com/api/v6/guilds/${serverId}/widget.json`
    return this._requestJson(
      this.authHelper.withBearerAuthHeader(
        {
          url,
          schema,
          httpErrors: {
            404: 'invalid server',
            403: 'widget disabled',
          },
        },
        'Bot',
      ),
    )
  }

  async handle({ serverId }) {
    const data = await this.fetch({ serverId })
    return this.constructor.render({ members: data.presence_count })
  }
}
