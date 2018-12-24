'use strict'

const BaseJsonService = require('../base-json')

const Joi = require('joi')
const schema = Joi.object({
  players: Joi.number().required(),
}).required()

module.exports = class BStatsPlayers extends BaseJsonService {
  static get route() {
    return {
      base: 'bstats/players',
      pattern: ':pluginid',
    }
  }

  static get defaultBadgeData() {
    return { label: 'players' }
  }

  async handle({ pluginid }) {
    const { players } = await this.fetch({ pluginid })
    return this.constructor.render({ players })
  }

  async fetch({ pluginid }) {
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
