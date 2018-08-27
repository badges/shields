'use strict'

const LegacyService = require('../legacy-service')
const { getDeprecatedBadge } = require('../../lib/deprecation-helpers')

// Magnum CI integration - deprecated as of July 2018
module.exports = class MagnumCi extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/magnumci\/ci\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const format = match[3]
        const badgeData = getDeprecatedBadge('magnum ci', data)
        sendBadge(format, badgeData)
      })
    )
  }
}
