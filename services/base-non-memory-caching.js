'use strict'

const makeBadge = require('../gh-badges/lib/make-badge')
const { makeSend } = require('../lib/result-sender')
const BaseService = require('./base')
const { setCacheHeaders } = require('./cache-headers')

// Badges are subject to two independent types of caching: in-memory and
// downstream.
//
// Services deriving from `NonMemoryCachingBaseService` are not cached in
// memory on the server. This means that each request that hits the server
// triggers another call to the handler. When using badges for server
// diagnostics, that's useful!
//
// In contrast, The `handle()` function of most other `BaseService`
// subclasses is wrapped in onboard, in-memory caching. See `lib /request-
// handler.js` and `BaseService.prototype.register()`.
//
// All services, including those extending NonMemoryCachingBaseServices, may
// be cached _downstream_. This is governed by cache headers, which are
// configured by the service, the user's request, and the server's default
// cache length.
module.exports = class NonMemoryCachingBaseService extends BaseService {
  static register({ camp }, serviceConfig) {
    const { cacheHeaders: cacheHeaderConfig } = serviceConfig
    const { _cacheLength: serviceCacheLengthSeconds } = this

    camp.route(this._regex, async (queryParams, match, end, ask) => {
      const namedParams = this._namedParamsForMatch(match)
      const serviceData = await this.invoke(
        {},
        serviceConfig,
        namedParams,
        queryParams
      )

      const badgeData = this._makeBadgeData(queryParams, serviceData)
      // The final capture group is the extension.
      const format = match.slice(-1)[0]
      badgeData.format = format

      const svg = makeBadge(badgeData)

      setCacheHeaders({
        cacheHeaderConfig,
        serviceCacheLengthSeconds,
        queryParams,
        res: ask.res,
      })

      makeSend(format, ask.res, end)(svg)
    })
  }
}
