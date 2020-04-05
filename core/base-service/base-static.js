'use strict'

const makeBadge = require('../../badge-maker/lib/make-badge')
const BaseService = require('./base')
const {
  serverHasBeenUpSinceResourceCached,
  setCacheHeadersForStaticResource,
} = require('./cache-headers')
const { makeSend } = require('./legacy-result-sender')
const { MetricHelper } = require('./metric-helper')
const coalesceBadge = require('./coalesce-badge')
const { prepareRoute, namedParamsForMatch } = require('./route')

module.exports = class BaseStaticService extends BaseService {
  static register({ camp, metricInstance }, serviceConfig) {
    const { regex, captureNames } = prepareRoute(this.route)

    const metricHelper = MetricHelper.create({
      metricInstance,
      ServiceClass: this,
    })

    camp.route(regex, async (queryParams, match, end, ask) => {
      if (serverHasBeenUpSinceResourceCached(ask.req)) {
        // Send Not Modified.
        ask.res.statusCode = 304
        ask.res.end()
        return
      }

      const metricHandle = metricHelper.startRequest()

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

      setCacheHeadersForStaticResource(ask.res)

      const svg = makeBadge(badgeData)
      makeSend(format, ask.res, end)(svg)

      metricHandle.noteResponseSent()
    })
  }
}
