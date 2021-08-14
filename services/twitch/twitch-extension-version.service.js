import Joi from 'joi'
import TwitchBase from './twitch-base.js'

const helixSchema = Joi.object({
  data: Joi.array().required(),
})

export default class TwitchExtensionVersion extends TwitchBase {
  static category = 'version'

  static route = {
    base: 'twitch/extension/v',
    pattern: ':extensionId',
  }

  static examples = [
    {
      title: 'Twitch Extension Version',
      namedParams: {
        extensionId: '2nq5cu1nc9f4p75b791w8d3yo9d195',
      },
      staticPreview: this.render({ version: '1.0.0' }),
    },
  ]

  static defaultBadgeData = {
    label: 'twitch extension',
  }

  static render({ version }) {
    return {
      label: 'twitch extension',
      message: `v${version}`,
      color: '6441A4',
    }
  }

  async fetch({ extensionId }) {
    const data = this._requestJson({
      schema: helixSchema,
      url: `https://api.twitch.tv/helix/extensions/released`,
      options: {
        qs: { extension_id: extensionId },
      },
    })

    return data
  }

  async handle({ extensionId }) {
    const data = await this.fetch({ extensionId })
    return this.constructor.render({
      extensionId,
      version: data.data[0].version,
    })
  }
}
