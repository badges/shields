'use strict'

const { BaseSpigetService, documentation } = require('./spiget-base')

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
    return this.constructor.render({ version: name })
  }

  static render({ version }) {
    return {
      message: `v${version}`,
    }
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
        staticPreview: this.render({ version: 2.1 }),
        documentation,
      },
    ]
  }
}
