'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CpanLicense extends LegacyService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'cpan/l',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'CPAN',
        namedParams: { packageName: 'Config-Augeas' },
        staticPreview: { label: 'CPAN', message: 'lgpl_2_1', color: 'blue' },
        keywords: ['perl'],
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}
