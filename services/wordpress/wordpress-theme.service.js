'use strict'

const queryString = require('query-string')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric, starRating } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')

module.exports = class WordpressTheme extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    // wordpress theme rating integration.
    // example: https://img.shields.io/wordpress/theme/r/hestia.svg for https://wordpress.org/themes/hestia
    camp.route(
      /^\/wordpress\/theme\/r\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const queryParams = {
          action: 'theme_information',
          'request[slug]': match[1], // eg, `hestia`.
        }
        const format = match[2]
        const apiUrl =
          'https://api.wordpress.org/themes/info/1.1/?' +
          queryString.stringify(queryParams)
        const badgeData = getBadgeData('rating', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            let rating = parseInt(JSON.parse(buffer).rating)
            rating = (rating / 100) * 5
            badgeData.text[1] = starRating(rating)
            if (rating === 0) {
              badgeData.colorscheme = 'red'
            } else if (rating < 2) {
              badgeData.colorscheme = 'yellow'
            } else if (rating < 3) {
              badgeData.colorscheme = 'yellowgreen'
            } else if (rating < 4) {
              badgeData.colorscheme = 'green'
            } else {
              badgeData.colorscheme = 'brightgreen'
            }
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )

    // wordpress theme download integration.
    // example: https://img.shields.io/wordpress/theme/dt/hestia.svg for https://wordpress.org/themes/hestia
    camp.route(
      /^\/wordpress\/theme\/dt\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const queryParams = {
          action: 'theme_information',
          'request[slug]': match[1], // eg, `hestia`.
        }
        const format = match[2]
        const apiUrl =
          'https://api.wordpress.org/themes/info/1.1/?' +
          queryString.stringify(queryParams)
        const badgeData = getBadgeData('downloads', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const downloads = JSON.parse(buffer).downloaded
            badgeData.text[1] = metric(downloads)
            badgeData.colorscheme = downloadCountColor(downloads)
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
