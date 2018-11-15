'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CocoapodsPlatform extends LegacyService {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'cocoapods/p',
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
