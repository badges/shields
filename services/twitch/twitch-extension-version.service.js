import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import TwitchBase from './twitch-base.js'

const helixSchema = Joi.object({
  data: Joi.array()
    .items(Joi.object({ version: Joi.string().required() }).required())
    .min(1)
    .required(),
})

export default class TwitchExtensionVersion extends TwitchBase {
  static category = 'version'

  static route = {
    base: 'twitch/extension/v',
    pattern: ':extensionId',
  }

  static openApi = {
    '/twitch/extension/v/{extensionId}': {
      get: {
        summary: 'Twitch Extension Version',
        parameters: pathParams({
          name: 'extensionId',
          example: '2nq5cu1nc9f4p75b791w8d3yo9d195',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'twitch extension',
  }

  async fetch({ extensionId }) {
    const data = this._requestJson({
      schema: helixSchema,
      url: 'https://api.twitch.tv/helix/extensions/released',
      options: {
        searchParams: { extension_id: extensionId },
      },
    })

    return data
  }

  async handle({ extensionId }) {
    const data = await this.fetch({ extensionId })

    return renderVersionBadge({ version: data.data[0].version })
  }
}
