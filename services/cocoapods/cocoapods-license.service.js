'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CocoapodsLicense extends LegacyService {
  static get category() {
    return 'license'
  }

  static get url() {
    return {
      base: 'cocoapods/l',
    }
  }

  static get examples() {
    return [
      {
        title: 'Cocoapods',
        previewUrl: 'AFNetworking',
      },
    ]
  }

  // Legacy route handler is defined in cocoapods.service.js.
  static registerLegacyRouteHandler() {}
}
