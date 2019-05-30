'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.array()
  .items(Joi.array().items([Joi.number().required(), Joi.number().required()]))
  .required()

module.exports = class BStatsPlayers extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'bstats/players',
      pattern: ':pluginid',
    }
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

  static get defaultBadgeData() {
    return {
      label: 'players',
      color: 'blue',
    }
  }

  static render({ players }) {
    return {
      message: metric(players),
    }
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

  transform({ json }) {
    const players = json[0][1]
    return { players }
  }

  async handle({ pluginid }) {
    const json = await this.fetch({ pluginid })
    const { players } = this.transform({ json })
    return this.constructor.render({ players })
  }
}
