'use strict'

const BaseService = require('./base')

// registerFn: ({ camp, cache }) => { camp.route(/.../, cache(...)) }
class LegacyService extends BaseService {
  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    throw Error(`registerLegacyRouteHandler() not implemented for ${this.name}`)
  }

  static register(
    { camp, handleRequest: cache, githubApiProvider },
    serviceConfig
  ) {
    this.registerLegacyRouteHandler({
      camp,
      cache,
      githubApiProvider,
    })
  }
}

module.exports = LegacyService
