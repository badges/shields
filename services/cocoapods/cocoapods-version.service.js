'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CocoapodsVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'cocoapods/v',
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
