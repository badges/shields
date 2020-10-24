'use strict'

const { renderVersionBadge } = require('../version')
const { InvalidResponse } = require('..')
const { BaseOreService, documentation, keywords } = require('./ore-base')

module.exports = class OreVersion extends BaseOreService {
  static category = 'version'

  static route = {
    base: 'ore/v',
    pattern: ':pluginId',
  }

  static examples = [
    {
      title: 'Ore Version',
      namedParams: {
        pluginId: 'nucleus',
      },
      staticPreview: renderVersionBadge({ version: '2.2.3' }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'version',
  }

  async handle({ pluginId }) {
    const { promoted_versions } = await this.fetch({ pluginId })
    if (promoted_versions.length === 0) {
      throw new InvalidResponse({ prettyMessage: 'no promoted versions' })
    }
    const { version } = promoted_versions[0]
    return renderVersionBadge({ version })
  }
}
