'use strict'

const LegacyService = require('../legacy-service')

module.exports = class CondaDownloads extends LegacyService {
  static get category() {
    return 'version'
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
        previewUrl: 'v/conda-forge/python',
      },
      {
        title: 'Conda (channel only)',
        previewUrl: 'vn/conda-forge/python',
      },
    ]
  }

  // Legacy route handler is defined in conda.service.js.
  static registerLegacyRouteHandler() {}
}
