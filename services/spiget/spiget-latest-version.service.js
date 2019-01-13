'use strict'

const { BaseSpigetService, documentation } = require('./spiget-base')

const { renderVersionBadge } = require('../../lib/version')

module.exports = class SpigetLatestVersion extends BaseSpigetService {
  static get route() {
    return {
      base: 'spiget/version',
      pattern: ':resourceid',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'version',
      color: 'blue',
    }
  }

  async handle({ resourceid }) {
    const { name } = await this.fetchLatestVersion({ resourceid })
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
          resourceid: '9089',
        },
        staticPreview: renderVersionBadge({ version: 2.1 }),
        documentation,
      },
    ]
  }
}
