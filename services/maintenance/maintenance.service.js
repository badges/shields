'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const log = require('../../lib/log')

module.exports = class Maintenance extends LegacyService {
  static get category() {
    return 'other'
  }

  static get url() {
    return {
      base: 'maintenance',
    }
  }

  static get examples() {
    return [
      {
        title: 'Maintenance',
        previewUrl: 'yes/2017',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/maintenance\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const status = match[1] // eg, yes
        const year = +match[2] // eg, 2016
        const format = match[3]
        const badgeData = getBadgeData('maintained', data)
        try {
          const now = new Date()
          const cy = now.getUTCFullYear() // current year.
          const m = now.getUTCMonth() // month.
          if (status === 'no') {
            badgeData.text[1] = 'no! (as of ' + year + ')'
            badgeData.colorscheme = 'red'
          } else if (cy <= year) {
            badgeData.text[1] = status
            badgeData.colorscheme = 'brightgreen'
          } else if (cy === year + 1 && m < 3) {
            badgeData.text[1] = 'stale (as of ' + cy + ')'
          } else {
            badgeData.text[1] = 'no! (as of ' + year + ')'
            badgeData.colorscheme = 'red'
          }
          sendBadge(format, badgeData)
        } catch (e) {
          log.error(e.stack)
          badgeData.text[1] = 'invalid'
          sendBadge(format, badgeData)
        }
      })
    )
  }
}
