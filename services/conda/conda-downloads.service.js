'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CondaDownloads extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'conda',
    }
  }

  static get examples() {
    return [
      {
        title: 'Conda',
        previewUrl: 'dn/conda-forge/python',
      },
    ]
  }

  // Legacy route handler is defined in conda.service.js.
  static registerLegacyRouteHandler() {}
}
