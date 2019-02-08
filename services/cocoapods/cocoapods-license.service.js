'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CocoapodsLicense extends LegacyService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'cocoapods/l',
      pattern: ':spec',
    }
  }

  static get examples() {
    return [
      {
        title: 'Cocoapods',
        namedParams: { spec: 'AFNetworking' },
        staticPreview: { label: 'license', message: 'MIT', color: '000' },
      },
    ]
  }

  // Legacy route handler is defined in cocoapods.service.js.
  static registerLegacyRouteHandler() {}
}
