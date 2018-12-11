'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CocoapodsLicense extends LegacyService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'cocoapods/l',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Cocoapods',
        namedParams: { packageName: 'AFNetworking' },
        staticPreview: { label: 'license', message: 'MIT', color: '000' },
      },
    ]
  }

  // Legacy route handler is defined in cocoapods.service.js.
  static registerLegacyRouteHandler() {}
}
