'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CpanVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'cpan/v',
    }
  }

  static get examples() {
    return [
      {
        title: 'CPAN',
        previewUrl: 'Config-Augeas',
        keywords: ['perl'],
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}
