'use strict'

const makeBadge = require('../../gh-badges/lib/make-badge')
const BaseService = require('./base')
const { setCacheHeaders } = require('./cache-headers')
const { makeSend } = require('./legacy-result-sender')
const coalesceBadge = require('./coalesce-badge')
const { prepareRoute, namedParamsForMatch } = require('./route')

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
  static register({ camp, requestCounter }, serviceConfig) {
    const { cacheHeaders: cacheHeaderConfig } = serviceConfig
    const { _cacheLength: serviceDefaultCacheLengthSeconds } = this
    const { regex, captureNames } = prepareRoute(this.route)

    const serviceRequestCounter = this._createServiceRequestCounter({
      requestCounter,
    })

    camp.route(regex, async (queryParams, match, end, ask) => {
      const namedParams = namedParamsForMatch(captureNames, match, this)
      const serviceData = await this.invoke(
        {},
        serviceConfig,
        namedParams,
        queryParams
      )

      const badgeData = coalesceBadge(
        queryParams,
        serviceData,
        this.defaultBadgeData,
        this
      )

      // The final capture group is the extension.
      const format = (match.slice(-1)[0] || '.svg').replace(/^\./, '')
      badgeData.format = format

      const svg = makeBadge(badgeData)

      setCacheHeaders({
        cacheHeaderConfig,
        serviceDefaultCacheLengthSeconds,
        queryParams,
        res: ask.res,
      })

      makeSend(format, ask.res, end)(svg)

      serviceRequestCounter.inc()
    })
  }
}
