'use strict'

const LegacyService = require('../legacy-service')
const { getDeprecatedBadge } = require('../../lib/deprecation-helpers')

module.exports = class SnapCi extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/snap(-ci?)\/([^/]+\/[^/]+)(?:\/(.+))\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const format = match[4]
        const badgeData = getDeprecatedBadge('snap CI', data)
        sendBadge(format, badgeData)
      })
    )
  }
}
