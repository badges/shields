'use strict'

const makeBadge = require('../gh-badges/lib/make-badge')
const { makeSend } = require('../lib/result-sender')
const BaseService = require('./base')

function isInt(number) {
  return number !== undefined && /^[0-9]+$/.test(number)
}

// The `handle()` function of most `BaseService` subclasses is wrapped in caching
// logic. See `lib/request-handler.js` and `BaseService.prototype.register()`.
//
// In contrast, services deriving from `BaseNoncachedService` are not cached
// on the server. They may be cached downstream, however.
//
// Typicaly each request that hits the server triggers another call to the
// handler. This makes them more useful for internal diagnostics.
module.exports = class NoncachingBaseService extends BaseService {
  // Note: Like the static service, not `async`.
  handle(namedParams, queryParams) {
    throw new Error(`Handler not implemented for ${this.constructor.name}`)
  }

  static register({ camp }, serviceConfig) {
    camp.route(this._regex, async (queryParams, match, end, ask) => {
      let cacheSecs
      if (this._cacheLength === undefined) {
        cacheSecs = isInt(process.env.BADGE_MAX_AGE_SECONDS)
          ? parseInt(process.env.BADGE_MAX_AGE_SECONDS)
          : 120
      } else {
        cacheSecs = this._cacheLength
      }
      ask.res.setHeader('Cache-Control', `max-age=${cacheSecs}`)
      const reqTime = new Date()
      const date = new Date(+reqTime + cacheSecs * 1000).toGMTString()
      ask.res.setHeader('Expires', date)

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
      makeSend(format, ask.res, end)(svg)
    })
  }
}
