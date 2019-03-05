'use strict'

const { renderVersionBadge } = require('../version')
const { BaseAmoService, keywords } = require('./amo-base')

module.exports = class AmoVersion extends BaseAmoService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'amo/v',
      pattern: ':addonId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Mozilla Add-on',
        namedParams: { addonId: 'dustman' },
        staticPreview: renderVersionBadge({ version: '2.1.0' }),
        keywords,
      },
    ]
  }

  async handle({ addonId }) {
    const data = await this.fetch({ addonId })
    return renderVersionBadge({ version: data.current_version.version })
  }
}
