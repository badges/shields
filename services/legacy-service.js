'use strict'

const BaseService = require('./base')

// registerFn: ({ camp, cache }) => { camp.route(/.../, cache(...)) }
class LegacyService extends BaseService {
  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    throw Error(`registerLegacyRouteHandler() not implemented for ${this.name}`)
  }

  static register({ camp, handleRequest, githubApiProvider }, serviceConfig) {
    const { cache: cacheHeaderConfig } = serviceConfig
    this.registerLegacyRouteHandler({
      camp,
      cache: (...args) => handleRequest(cacheHeaderConfig, ...args),
      githubApiProvider,
    })
  }
}

module.exports = LegacyService
