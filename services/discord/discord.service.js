'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const discordSchema = Joi.object({
  members: Joi.array()
    .allow(null)
    .required(),
}).required()

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

  async handle({ serverId }) {
    const data = await this.fetch({ serverId })
    const members = Array.isArray(data.members) ? data.members : []
    return this.constructor.render({ members: members.length })
  }
}
