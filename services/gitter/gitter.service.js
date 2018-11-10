'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class Gitter extends LegacyService {
  static get category() {
    return 'chat'
  }

  static get route() {
    return { base: 'gitter/room' }
  }

  static get examples() {
    return [
      {
        title: 'Gitter',
        previewUrl: 'nwjs/nw.js',
      },
    ]
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
