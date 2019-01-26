'use strict'

const { BaseService } = require('.')

// This adapter allows running legacy badges in the new file layout and
// service architecture.
//
// There are some tips for rewriting legacy services:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not use this for new services. New services should derive from e.g.
// BaseJsonService. Refer to the tutorial:
// https://github.com/badges/shields/blob/master/doc/TUTORIAL.md
class LegacyService extends BaseService {
  // Provide a placeholder for services which do not define a route.
  static get route() {
    return { pattern: '' }
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    throw Error(`registerLegacyRouteHandler() not implemented for ${this.name}`)
  }

  static register({ camp, handleRequest, githubApiProvider }, serviceConfig) {
    const { cacheHeaders: cacheHeaderConfig } = serviceConfig
    this.registerLegacyRouteHandler({
      camp,
      cache: (...args) => handleRequest(cacheHeaderConfig, ...args),
      githubApiProvider,
    })
  }
}

module.exports = LegacyService
