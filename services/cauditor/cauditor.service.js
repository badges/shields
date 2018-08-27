'use strict'

const LegacyService = require('../legacy-service')
const { getDeprecatedBadge } = require('../../lib/deprecation-helpers')

// Cauditor integration - Badge deprectiated as of March 2018
module.exports = class Cauditor extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/cauditor\/(mi|ccn|npath|hi|i|ca|ce|dit)\/([^/]+)\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const format = match[5]
        const badgeData = getDeprecatedBadge('cauditor', data)
        sendBadge(format, badgeData)
      })
    )
  }
}
