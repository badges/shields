'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const discordSchema = Joi.object({
  members: Joi.array()
    .allow(null)
    .required(),
}).required()

module.exports = class Discord extends BaseJsonService {
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

  static get _cacheLength() {
    return 30
  }

  static render({ members }) {
    return {
      message: `${members} online`,
      color: 'brightgreen',
    }
  }

  async handle({ serverId }) {
    const data = await this.fetch({ serverId })
    const members = Array.isArray(data.members) ? data.members : []
    return this.constructor.render({ members: members.length })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'chat' }
  }

  static get category() {
    return 'chat'
  }

  static get route() {
    return {
      base: 'discord',
      format: '([^/]+)',
      capture: ['serverId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Discord',
        exampleUrl: '102860784329052160',
        pattern: ':serverId',
        staticExample: this.render({ members: 23 }),
      },
    ]
  }
}
