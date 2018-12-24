'use strict' // (1)

const BaseJsonService = require('../base-json') // (2)

const Joi = require('joi') // (4)
const schema = Joi.object({
  // (4)
  servers: Joi.number().required(), // (4)
}).required() // (4)

module.exports = class BStatsServers extends BaseJsonService {
  // (5)

  static get route() {
    // (6)
    return {
      base: 'bstats/servers',
      pattern: ':pluginid',
    }
  }

  static get defaultBadgeData() {
    // (7)
    return { label: 'servers' }
  }

  async handle({ pluginid }) {
    // (8)
    const { servers } = await this.fetch({ pluginid })
    return this.constructor.render({ servers })
  }

  async fetch({ pluginid }) {
    // (9)
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
