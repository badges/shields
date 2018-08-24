'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const {
  isDeprecated,
  getDeprecatedBadge,
} = require('../../lib/deprecation-helpers')

const serverStartTime = new Date(new Date().toGMTString())

module.exports = class Gemnasium extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/gemnasium\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const userRepo = match[1] // eg, `jekyll/jekyll`.
        const format = match[2]

        if (isDeprecated('gemnasium', serverStartTime)) {
          const badgeData = getDeprecatedBadge('gemnasium', data)
          sendBadge(format, badgeData)
          return
        }

        const options = 'https://gemnasium.com/' + userRepo + '.svg'
        const badgeData = getBadgeData('dependencies', data)
        request(options, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const nameMatch = buffer.match(/(devD|d)ependencies/)[0]
            const statusMatch = buffer.match(/'14'>(.+)<\/text>\s*<\/g>/)[1]
            badgeData.text[0] = getLabel(nameMatch, data)
            badgeData.text[1] = statusMatch
            if (statusMatch === 'up-to-date') {
              badgeData.text[1] = 'up to date'
              badgeData.colorscheme = 'brightgreen'
            } else if (statusMatch === 'out-of-date') {
              badgeData.text[1] = 'out of date'
              badgeData.colorscheme = 'yellow'
            } else if (statusMatch === 'update!') {
              badgeData.colorscheme = 'red'
            } else if (statusMatch === 'none') {
              badgeData.colorscheme = 'brightgreen'
            } else {
              badgeData.text[1] = 'undefined'
            }
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
