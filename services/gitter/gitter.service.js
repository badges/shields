'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class Gitter extends LegacyService {
  static get url() {
    return { base: 'gitter' }
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/gitter\/room\/([^/]+\/[^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        // match[1] is the repo, which is not used.
        const format = match[2]

        const badgeData = getBadgeData('chat', data)
        badgeData.text[1] = 'on gitter'
        badgeData.colorscheme = 'brightgreen'
        sendBadge(format, badgeData)
      })
    )
  }
}
