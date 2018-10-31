'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  setBadgeColor,
} = require('../../lib/badge-data')
const { escapeFormatSlashes } = require('../../lib/path-helpers')

// Test if a webpage is online.
module.exports = class Website extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/website(-(([^-/]|--|\/\/)+)-(([^-/]|--|\/\/)+)(-(([^-/]|--|\/\/)+)-(([^-/]|--|\/\/)+))?)?\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const onlineMessage = escapeFormatSlashes(
          match[2] != null ? match[2] : 'online'
        )
        const offlineMessage = escapeFormatSlashes(
          match[4] != null ? match[4] : 'offline'
        )
        const onlineColor = escapeFormatSlashes(
          match[7] != null ? match[7] : 'brightgreen'
        )
        const offlineColor = escapeFormatSlashes(
          match[9] != null ? match[9] : 'red'
        )
        const userProtocol = match[11]
        const userURI = match[12]
        const format = match[13]
        const withProtocolURI = `${userProtocol}://${userURI}`
        const options = {
          method: 'HEAD',
          uri: withProtocolURI,
        }
        const badgeData = getBadgeData('website', data)
        badgeData.colorscheme = undefined
        request(options, (err, res) => {
          // We consider all HTTP status codes below 310 as success.
          if (err != null || res.statusCode >= 310) {
            badgeData.text[1] = offlineMessage
            setBadgeColor(badgeData, offlineColor)
            sendBadge(format, badgeData)
          } else {
            badgeData.text[1] = onlineMessage
            setBadgeColor(badgeData, onlineColor)
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
