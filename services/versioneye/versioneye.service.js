'use strict'

const LegacyService = require('../legacy-service')
const { getDeprecatedBadge } = require('../../lib/deprecation-helpers')

// VersionEye integration - deprecated as of August 2018.
module.exports = class VersionEye extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/versioneye\/d\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const format = match[2]
        const badgeData = getDeprecatedBadge('versioneye', data)
        sendBadge(format, badgeData)
      })
    )
  }
}
