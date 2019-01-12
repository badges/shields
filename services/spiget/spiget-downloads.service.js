'use strict'

const { BaseSpigetService, documentation } = require('./spiget-base')
const { metric } = require('../../lib/text-formatters')

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
      color: 'brightgreen',
    }
  }

  async handle({ resourceid }) {
    const { downloads } = await this.fetch({ resourceid })
    return this.constructor.render({ downloads })
  }

  static render({ downloads }) {
    return {
      message: metric(downloads),
    }
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
      },
    ]
  }
}
