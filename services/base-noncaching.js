'use strict'

const makeBadge = require('../gh-badges/lib/make-badge')
const { makeSend } = require('../lib/result-sender')
const BaseService = require('./base')
const { coalesceCacheLength, setCacheHeaders } = require('./caching')

// All services may be cached downstream, as is controlled by the service,
// the user's request, and the configured default cache length.
//
// The `handle()` function of most `BaseService` subclasses is wrapped in
// _additional_  caching, which lives in memory on the servers. See
// `lib/request-handler.js` and `BaseService.prototype.register()`.
//
// In contrast, services deriving from `BaseNoncachedService` are _not_ cached
// on the server. This means that each request that hits the server triggers
// another call to the handler. This makes them more useful for server
// diagnostics.
module.exports = class NoncachingBaseService extends BaseService {
  static register({ camp }, serviceConfig) {
    const { cacheHeaders: cacheConfig } = serviceConfig

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

      const cacheLengthSeconds = coalesceCacheLength(
        cacheConfig,
        this._cacheLength,
        queryParams
      )
      setCacheHeaders(cacheLengthSeconds)

      makeSend(format, ask.res, end)(svg)
    })
  }
}
