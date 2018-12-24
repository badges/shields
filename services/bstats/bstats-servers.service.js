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
    return { label: 'servers' }
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
      label: 'servers',
      message: servers,
      color: 'blue',
    }
  }

  // Front page

  static get category() {
    return 'other'
  }
  static get examples() {
    return [
      {
        title: 'bStats Servers',
        exampleUrl: '1',
        pattern: ':pluginid',
        staticPreview: {
          label: 'servers',
          color: 'blue',
          message: 57479,
        },
      },
    ]
  }
}
