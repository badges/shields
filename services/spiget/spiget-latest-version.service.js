'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { BaseSpigetService, documentation, keywords } = require('./spiget-base')

const versionSchema = Joi.object({
  downloads: Joi.number().required(),
  name: Joi.string().required(),
}).required()

module.exports = class SpigetLatestVersion extends BaseSpigetService {
  static category = 'version'

  static route = {
    base: 'spiget/version',
    pattern: ':resourceId',
  }

  static examples = [
    {
      title: 'Spiget Version',
      namedParams: {
        resourceId: '9089',
      },
      staticPreview: renderVersionBadge({ version: 2.1 }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'spiget',
    color: 'blue',
  }

  async handle({ resourceId }) {
    const { name } = await this.fetch({
      resourceId,
      schema: versionSchema,
      url: `https://api.spiget.org/v2/resources/${resourceId}/versions/latest`,
    })
    return renderVersionBadge({ version: name })
  }
}
