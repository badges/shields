'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CpanLicense extends LegacyService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'cpan/l',
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
