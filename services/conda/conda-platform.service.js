'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CondaPlatform extends LegacyService {
  static get category() {
    return 'platform-support'
  }

  static get url() {
    return {
      base: 'conda',
    }
  }

  static get examples() {
    return [
      {
        title: 'Conda',
        previewUrl: 'pn/conda-forge/python',
      },
    ]
  }

  // Legacy route handler is defined in conda.service.js.
  static registerLegacyRouteHandler() {}
}
