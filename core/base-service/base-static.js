'use strict'

const makeBadge = require('../../gh-badges/lib/make-badge')
const BaseService = require('./base')
const {
  serverHasBeenUpSinceResourceCached,
  setCacheHeadersForStaticResource,
} = require('./cache-headers')
const { makeSend } = require('./legacy-result-sender')
const coalesceBadge = require('./coalesce-badge')
const { prepareRoute, namedParamsForMatch } = require('./route')

module.exports = class BaseStaticService extends BaseService {
  static register({ camp, requestCounter }, serviceConfig) {
    const {
      profiling: { makeBadge: shouldProfileMakeBadge },
    } = serviceConfig
    const { regex, captureNames } = prepareRoute(this.route)

    const serviceRequestCounter = this._createServiceRequestCounter({
      requestCounter,
    })

    camp.route(regex, async (queryParams, match, end, ask) => {
      if (serverHasBeenUpSinceResourceCached(ask.req)) {
        // Send Not Modified.
        ask.res.statusCode = 304
        ask.res.end()
        return
      }

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

      if (shouldProfileMakeBadge) {
        console.time('makeBadge total')
      }
      const svg = makeBadge(badgeData)
      if (shouldProfileMakeBadge) {
        console.timeEnd('makeBadge total')
      }

      setCacheHeadersForStaticResource(ask.res)

      makeSend(format, ask.res, end)(svg)

      serviceRequestCounter.inc()
    })
  }
}
