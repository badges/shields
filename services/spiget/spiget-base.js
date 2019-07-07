'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const resourceSchema = Joi.object({
  downloads: Joi.number().required(),
  file: Joi.object({
    size: Joi.number().required(),
    sizeUnit: Joi.string().required(),
  }).required(),
  testedVersions: Joi.array(),
  rating: Joi.object({
    count: Joi.number().required(),
    average: Joi.number().required(),
  }).required(),
}).required()

const documentation = `
<p>You can find your resource ID in the url for your resource page.</p>
<p>Example: <code>https://www.spigotmc.org/resources/essentialsx.9089/</code> - Here the Resource ID is 9089.</p>`

const keywords = ['spigot', 'spigotmc']

class BaseSpigetService extends BaseJsonService {
  async fetch({
    resourceId,
    schema = resourceSchema,
    url = `https://api.spiget.org/v2/resources/${resourceId}`,
  }) {
    return this._requestJson({
      schema,
      url,
    })
  }
}

module.exports = { keywords, documentation, BaseSpigetService }
