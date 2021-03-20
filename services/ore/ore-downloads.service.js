'use strict'

const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const { BaseOreService, documentation, keywords } = require('./ore-base')

module.exports = class OreDownloads extends BaseOreService {
  static category = 'downloads'

  static route = {
    base: 'ore/dt',
    pattern: ':pluginId',
  }

  static examples = [
    {
      title: 'Ore Downloads',
      namedParams: {
        pluginId: 'nucleus',
      },
      staticPreview: this.render({ downloads: 560891 }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'downloads',
  }

  static render({ downloads }) {
    return {
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async handle({ pluginId }) {
    const {
      stats: { downloads },
    } = await this.fetch({ pluginId })
    return this.constructor.render({ downloads })
  }
}
