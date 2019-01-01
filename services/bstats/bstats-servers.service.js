'use strict'

const BaseJsonService = require('../base-json')

const Joi = require('joi')
const schema = Joi.object({
  servers: Joi.number().required(),
}).required()

module.exports = class BStatsServers extends BaseJsonService {
  static get route() {
    return {
      base: 'bstats/servers',
      pattern: ':pluginid',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'servers',
      color: 'blue',
    }
  }

  async handle({ pluginid }) {
    const { servers } = await this.fetch({ pluginid })
    return this.constructor.render({ servers })
  }

  async fetch({ pluginid }) {
    return this._requestJson({
      schema,
      url: `https://bstats-api-format.glitch.me/servers/${pluginid}`,
    })
  }

  static render({ servers }) {
    return {
      message: servers,
    }
  }

  static get category() {
    return 'other'
  }
  static get examples() {
    return [
      {
        title: 'bStats Servers',
        namedParams: {
          pluginid: '1',
        },
        staticPreview: this.render({ servers: 57479 }),
      },
    ]
  }
}
