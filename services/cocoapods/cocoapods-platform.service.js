'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CocoapodsPlatform extends LegacyService {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'cocoapods/p',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Cocoapods',
        namedParams: { packageName: 'AFNetworking' },
        staticPreview: {
          label: 'platform',
          message: 'ios | osx | watchos | tvos',
          color: 'lightgrey',
        },
      },
    ]
  }

  // Legacy route handler is defined in cocoapods.service.js.
  static registerLegacyRouteHandler() {}
}
