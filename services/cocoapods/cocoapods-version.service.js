'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CocoapodsVersion extends LegacyService {
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
        namedParams: {
          spec: 'AFNetworking',
        },
        staticPreview: {
          label: 'pod',
          message: 'v3.2.1',
          color: 'blue',
        },
      },
    ]
  }

  // Legacy route handler is defined in cocoapods.service.js.
  static registerLegacyRouteHandler() {}
}
