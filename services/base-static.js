'use strict'

const makeBadge = require('../gh-badges/lib/make-badge')
const { makeSend } = require('../lib/result-sender')
const analytics = require('../core/server/analytics')
const BaseService = require('./base')
const {
  serverHasBeenUpSinceResourceCached,
  setCacheHeadersForStaticResource,
} = require('./cache-headers')

module.exports = class BaseStaticService extends BaseService {
  static register({ camp }, serviceConfig) {
    const {
      profiling: { makeBadge: shouldProfileMakeBadge },
    } = serviceConfig

    camp.route(this._regex, async (queryParams, match, end, ask) => {
      analytics.noteRequest(queryParams, match)

      if (serverHasBeenUpSinceResourceCached(ask.req)) {
        // Send Not Modified.
        ask.res.statusCode = 304
        ask.res.end()
        return
      }

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

      if (shouldProfileMakeBadge) {
        console.time('makeBadge total')
      }
      const svg = makeBadge(badgeData)
      if (shouldProfileMakeBadge) {
        console.timeEnd('makeBadge total')
      }

      setCacheHeadersForStaticResource(ask.res)

      makeSend(format, ask.res, end)(svg)
    })
  }
}
