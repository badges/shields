'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const discordSchema = Joi.object({
  presence_count: nonNegativeInteger,
}).required()

const proxySchema = Joi.object({
  message: Joi.string().required(),
  color: Joi.string().required(),
}).required()

const documentation = `
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

module.exports = class Discord extends BaseJsonService {
  static get category() {
    return 'chat'
  }

  static get route() {
    return {
      base: 'discord',
      pattern: ':serverId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Discord',
        namedParams: { serverId: '102860784329052160' },
        staticPreview: this.render({ members: 23 }),
        documentation,
      },
    ]
  }

  static get _cacheLength() {
    return 30
  }

  static get defaultBadgeData() {
    return { label: 'chat' }
  }

  static render({ members }) {
    return {
      message: `${members} online`,
      color: 'brightgreen',
    }
  }

  constructor(context, config) {
    super(context, config)
    this._shieldsProductionHerokuHacks = config.shieldsProductionHerokuHacks
  }

  async fetch({ serverId }) {
    const url = `https://discordapp.com/api/guilds/${serverId}/widget.json`
    return this._requestJson({
      url,
      schema: discordSchema,
      errorMessages: {
        404: 'invalid server',
        403: 'widget disabled',
      },
    })
  }

  async fetchOvhProxy({ serverId }) {
    return this._requestJson({
      url: `https://legacy-img.shields.io/discord/${serverId}.json`,
      schema: proxySchema,
    })
  }

  async handle({ serverId }) {
    if (this._shieldsProductionHerokuHacks) {
      const { message, color } = await this.fetchOvhProxy({ serverId })
      return { message, color }
    }

    const data = await this.fetch({ serverId })
    return this.constructor.render({ members: data.presence_count })
  }
}
