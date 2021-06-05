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
        pluginid: '11269', // example is a bungee proxy plugin. id must be the id of a proxy plugin to have managed servers
      },
      staticPreview: this.render({ managedServers: 8801 }),
    },
  ]

  static defaultBadgeData = { label: 'managed servers', color: 'blue' }

  static render({ managedServers }) {
    return {
      message: metric(managedServers),
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
    const managedServers = json[0][1]
    return { managedServers }
  }

  async handle({ pluginid }) {
    const json = await this.fetch({ pluginid })
    const { managedServers } = this.transform({ json })
    return this.constructor.render({ managedServers })
  }
}
