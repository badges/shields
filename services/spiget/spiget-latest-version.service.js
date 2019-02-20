'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../../lib/version')
const { BaseSpigetService, documentation, keywords } = require('./spiget-base')

const versionSchema = Joi.object({
  downloads: Joi.number().required(),
  name: Joi.string().required(),
}).required()

module.exports = class SpigetLatestVersion extends BaseSpigetService {
  static get route() {
    return {
      base: 'spiget/version',
      pattern: ':resourceId',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'spiget',
      color: 'blue',
    }
  }

  async handle({ resourceId }) {
    const { name } = await this.fetch({
      resourceId,
      schema: versionSchema,
      url: `https://api.spiget.org/v2/resources/${resourceId}/versions/latest`,
    })
    return renderVersionBadge({ version: name })
  }

  static get category() {
    return 'version'
  }

  static get examples() {
    return [
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
  }
}
