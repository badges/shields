'use strict'

const BaseService = require('./base')

// registerFn: ({ camp, cache }) => { camp.route(/.../, cache(...)) }
class LegacyService extends BaseService {
  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    throw Error('registerLegacyRouteHandler() not implemented')
  }

  static register({ camp, handleRequest, githubApiProvider }, serviceConfig) {
    const { cache: cacheConfig } = serviceConfig
    this.registerLegacyRouteHandler({
      camp,
      cache: (...args) => handleRequest(cacheConfig, ...args),
      githubApiProvider,
    })
  }
}

module.exports = LegacyService
