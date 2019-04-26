'use strict'

const { renderVersionBadge } = require('../version')
const BaseCocoaPodsService = require('./cocoapods-base')

module.exports = class CocoapodsVersion extends BaseCocoaPodsService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'cocoapods/v',
      pattern: ':spec',
    }
  }

  static get examples() {
    return [
      {
        title: 'Cocoapods',
        namedParams: { spec: 'AFNetworking' },
        staticPreview: renderVersionBadge({ version: 'v3.2.1' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'pod' }
  }

  async handle({ spec }) {
    const { version } = await this.fetch({ spec })
    return renderVersionBadge({ version })
  }
}
