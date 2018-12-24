'use strict' // (1)

const BaseJsonService = require('../base-json') // (2)

const Joi = require('joi') // (4)
const schema = Joi.object({
  // (4)
  players: Joi.number().required(), // (4)
}).required() // (4)

module.exports = class BStatsPlayers extends BaseJsonService {
  // (5)

  static get route() {
    // (6)
    return {
      base: 'bstats/players',
      pattern: ':pluginid',
    }
  }

  static get defaultBadgeData() {
    // (7)
    return { label: 'players' }
  }

  async handle({ pluginid }) {
    // (8)
    const { players } = await this.fetch({ pluginid })
    return this.constructor.render({ players })
  }

  async fetch({ pluginid }) {
    // (9)
    return this._requestJson({
      schema,
      url: `https://bstats-api-format.glitch.me/players/${pluginid}`,
    })
  }

  static render({ players }) {
    return {
      label: 'players',
      message: players,
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
        title: 'bStats Players',
        exampleUrl: '1',
        pattern: ':pluginid',
        staticPreview: {
          label: 'servers',
          color: 'blue',
          message: 74299,
        },
      },
    ]
  }
}
