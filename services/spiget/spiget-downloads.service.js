'use strict'

const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const { BaseSpigetService, documentation, keywords } = require('./spiget-base')

module.exports = class SpigetDownloads extends BaseSpigetService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'spiget/downloads',
      pattern: ':resourceId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Spiget Downloads',
        namedParams: {
          resourceId: '9089',
        },
        staticPreview: this.render({ downloads: 560891 }),
        documentation,
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'downloads',
    }
  }

  static render({ downloads }) {
    return {
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async handle({ resourceId }) {
    const { downloads } = await this.fetch({ resourceId })
    return this.constructor.render({ downloads })
  }
}
