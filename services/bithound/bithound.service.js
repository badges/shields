'use strict'

const LegacyService = require('../legacy-service')
const { getDeprecatedBadge } = require('../../lib/deprecation-helpers')

// bitHound integration - deprecated as of July 2018
module.exports = class Bithound extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/bithound\/(code\/|dependencies\/|devDependencies\/)?(.+?)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const format = match[3]
        const badgeData = getDeprecatedBadge('bithound', data)
        sendBadge(format, badgeData)
      })
    )
  }
}
