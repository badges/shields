import makeBadge from '../../badge-maker/lib/make-badge.js'
import BaseService from './base.js'
import {
  serverHasBeenUpSinceResourceCached,
  setCacheHeadersForStaticResource,
} from './cache-headers.js'
import { makeSend } from './legacy-result-sender.js'
import { MetricHelper } from './metric-helper.js'
import coalesceBadge from './coalesce-badge.js'
import { prepareRoute, namedParamsForMatch } from './route.js'

export default class BaseStaticService extends BaseService {
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
