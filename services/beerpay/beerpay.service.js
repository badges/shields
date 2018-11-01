'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

// beerpay.io integration.
// e.g. JSON response: https://beerpay.io/api/v1/beerpay/projects/beerpay.io
// e.g. SVG badge: https://beerpay.io/beerpay/beerpay.io/badge.svg?style=flat-square
module.exports = class Beerpay extends LegacyService {
  static get category() {
    return 'funding'
  }

  static get url() {
    return { base: 'beerpay' }
  }

  static get examples() {
    return [
      {
        title: 'Beerpay',
        previewUrl: 'hashdog/scrapfy-chrome-extension',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/beerpay\/(.*)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, beerpay
        const project = match[2] // eg, beerpay.io
        const format = match[3]

        const apiUrl =
          'https://beerpay.io/api/v1/' + user + '/projects/' + project
        const badgeData = getBadgeData('beerpay', data)

        request(apiUrl, (err, res, buffer) => {
          if (err) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }

          try {
            const data = JSON.parse(buffer)
            badgeData.text[1] = '$' + (data.total_amount || 0)
            badgeData.colorscheme = 'red'
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
