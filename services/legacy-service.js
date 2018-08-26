'use strict'

const BaseService = require('./base')

// registerFn: ({ camp, cache }) => { camp.route(/.../, cache(...)) }
class LegacyService extends BaseService {
  static registerLegacyRouteHandler({ camp, cache }) {
    throw Error('registerLegacyRouteHandler() not implemented')
  }

  static register(camp, handleRequest, serviceConfig) {
    this.registerLegacyRouteHandler({ camp, cache: handleRequest })
  }
}

module.exports = LegacyService
