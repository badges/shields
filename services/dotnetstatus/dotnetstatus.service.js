'use strict'

const LegacyService = require('../legacy-service')
const { getDeprecatedBadge } = require('../../lib/deprecation-helpers')

// dotnet-status integration - deprecated as of April 2018.
module.exports = class DotnetStatus extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/dotnetstatus\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const format = match[2]
        const badgeData = getDeprecatedBadge('dotnet status', data)
        sendBadge(format, badgeData)
      })
    )
  }
}
