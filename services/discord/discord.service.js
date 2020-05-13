'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const discordSchema = Joi.object({
  presence_count: nonNegativeInteger,
}).required()

const discordInviteSchema = Joi.object({
  approximate_member_count: nonNegativeInteger,
  approximate_presence_count: nonNegativeInteger,
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
<p>
  To get the total member count you need to create a invite that never ends, and then add the <code>INVITE ID</code> after the <code>SERVER ID</code> in the URL<br>
  It will only show the online member when <code>INVITE ID</code> is not provided.
</p>
`

module.exports = class Discord extends BaseJsonService {
  static get category() {
    return 'chat'
  }

  static get route() {
    return {
      base: 'discord',
      pattern: ':serverId/:inviteId?',
    }
  }

  static get examples() {
    return [
      {
        title: 'Discord Online Members',
        namedParams: { serverId: '102860784329052160' },
        staticPreview: this.render({ presence: 10 }),
        documentation,
      },
      {
        title: 'Discord Online & Total Members',
        namedParams: { serverId: '102860784329052160', inviteId: 'NdsqWcj' },
        staticPreview: this.render({ members: 23, presence: 10 }),
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

  static render({ members = null, presence }) {
    if (members === null) {
      return {
        message: `${presence} online`,
        color: 'brightgreen',
      }
    }
    return {
      message: `${presence}/${members} online`,
      color: 'brightgreen',
    }
  }

  constructor(context, config) {
    super(context, config)
    this._shieldsProductionHerokuHacks = config.shieldsProductionHerokuHacks
  }

  async fetch({ serverId, inviteId }) {
    const url = inviteId
      ? `https://discordapp.com/api/invites/${inviteId}?with_counts=true`
      : `https://discordapp.com/api/guilds/${serverId}/widget.json`
    const schema = inviteId ? discordInviteSchema : discordSchema
    const data = await this._requestJson({
      url,
      schema,
      errorMessages: {
        404: 'invalid server',
        403: 'widget disabled',
      },
    })
    return data
  }

  async fetchOvhProxy({ serverId, inviteId }) {
    return this._requestJson({
      url: inviteId
        ? `https://legacy-img.shields.io/discord/${serverId}/${inviteId}.json`
        : `https://legacy-img.shields.io/discord/${serverId}.json`,
      schema: proxySchema,
    })
  }

  async handle({ serverId, inviteId }) {
    if (this._shieldsProductionHerokuHacks) {
      const { message, color } = await this.fetchOvhProxy({ serverId })
      return { message, color }
    }

    const data = await this.fetch({ serverId, inviteId })
    if (inviteId) {
      return this.constructor.render({
        members: data.approximate_member_count,
        presence: data.approximate_presence_count,
      })
    } else {
      return this.constructor.render({ presence: data.presence_count })
    }
  }
}
