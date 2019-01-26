'use strict'

const { metric } = require('../../lib/text-formatters')
const { downloadCount } = require('../../lib/color-formatters')
const { BaseSpigetService, documentation, keywords } = require('./spiget-base')

module.exports = class SpigetDownloads extends BaseSpigetService {
  static get route() {
    return {
      base: 'spiget/downloads',
      pattern: ':resourceid',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'downloads',
    }
  }

  async handle({ resourceid }) {
    const { downloads } = await this.fetch({ resourceid })
    return this.constructor.render({ downloads })
  }

  static render({ downloads }) {
    return {
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  static get category() {
    return 'downloads'
  }

  static get examples() {
    return [
      {
        title: 'Spiget Downloads',
        namedParams: {
          resourceid: '9089',
        },
        staticPreview: this.render({ downloads: 560891 }),
        documentation,
        keywords,
      },
    ]
  }
}
