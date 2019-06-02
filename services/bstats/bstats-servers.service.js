'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.array()
  .items(Joi.array().items([Joi.number().required(), Joi.number().required()]))
  .required()

module.exports = class BStatsServers extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'bstats/servers',
      pattern: ':pluginid',
    }
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

  static get defaultBadgeData() {
    return {
      label: 'servers',
      color: 'blue',
    }
  }

  static render({ servers }) {
    return {
      message: metric(servers),
    }
  }

  async fetch({ pluginid }) {
    const url = `https://bstats.org/api/v1/plugins/${pluginid}/charts/servers/data`

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
    const servers = json[0][1]
    return { servers }
  }

  async handle({ pluginid }) {
    const json = await this.fetch({ pluginid })
    const { servers } = this.transform({ json })
    return this.constructor.render({ servers })
  }
}
