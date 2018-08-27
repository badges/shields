'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')

module.exports = class Libscore extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/libscore\/s\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const library = match[1] // eg, `jQuery`.
        const format = match[2]
        const apiUrl = 'http://api.libscore.com/v1/libraries/' + library
        const badgeData = getBadgeData('libscore', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            if (data.count.length === 0) {
              // Note the 'not found' response from libscore is:
              // status code = 200,
              // body = {"github":"","meta":{},"count":[],"sites":[]}
              badgeData.text[1] = 'not found'
              sendBadge(format, badgeData)
              return
            }
            badgeData.text[1] = metric(+data.count[data.count.length - 1])
            badgeData.colorscheme = 'blue'
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
