'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.array()
  .items(Joi.array().items(Joi.number().required(), Joi.number().required()))
  .required()

module.exports = class BStatsManagedServers extends BaseJsonService {
  static category = 'other'
  static route = { base: 'bstats/managed_servers', pattern: ':pluginid' }

  static examples = [
    {
      title: 'bStats Managed Servers',
      namedParams: {
        pluginid: '11269',
      },
      staticPreview: this.render({ servers: 11269 }),
    },
  ]

  static defaultBadgeData = { label: 'managed servers', color: 'blue' }

  static render({ managed_servers }) {
    return {
      message: metric(managed_servers),
    }
  }

  async fetch({ pluginid }) {
    const url = `https://bstats.org/api/v1/plugins/${pluginid}/charts/managed_servers/data`

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
    const managed_servers = json[0][1]
    return { managed_servers }
  }

  async handle({ pluginid }) {
    const json = await this.fetch({ pluginid })
    const { managed_servers } = this.transform({ json })
    return this.constructor.render({ managed_servers })
  }
}
