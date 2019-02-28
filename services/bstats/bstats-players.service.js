'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.array()
  .items(Joi.array().items([Joi.number().required(), Joi.number().required()]))
  .required()

module.exports = class BStatsPlayers extends BaseJsonService {
  static get route() {
    return {
      base: 'bstats/players',
      pattern: ':pluginid',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'players',
      color: 'blue',
    }
  }

  async handle({ pluginid }) {
    const json = await this.fetch({ pluginid })
    const { players } = this.transform({ json })
    return this.constructor.render({ players })
  }

  transform({ json }) {
    const players = json[0][1]
    return { players }
  }

  async fetch({ pluginid }) {
    const url = `https://bstats.org/api/v1/plugins/${pluginid}/charts/players/data`

    return this._requestJson({
      schema,
      options: {
        qs: {
          maxElements: 1,
        },
      },
      url,
    })
  }

  static render({ players }) {
    return {
      message: metric(players),
    }
  }

  static get category() {
    return 'other'
  }
  static get examples() {
    return [
      {
        title: 'bStats Players',
        namedParams: {
          pluginid: '1',
        },
        staticPreview: this.render({ players: 74299 }),
      },
    ]
  }
}
