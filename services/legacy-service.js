'use strict'

const BaseService = require('./base')

// registerFn: ({ camp, cache }) => { camp.route(/.../, cache(...)) }
class LegacyService extends BaseService {
  static registerLegacyHandler({ camp, cache }) {
    throw Error('registerLegacyHandler() not implemented')
  }

  static register(camp, handleRequest, serviceConfig) {
    this.registerLegacyHandler({ camp, cache: handleRequest })
  }
}

module.exports = LegacyService
