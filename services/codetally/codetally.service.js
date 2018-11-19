'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class Codetally extends LegacyService {
  static get category() {
    return 'funding'
  }

  static get route() {
    return {
      base: 'codetally',
    }
  }

  static get examples() {
    return [
      {
        title: 'Codetally',
        previewUrl: 'triggerman722/colorstrap',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/codetally\/(.*)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const owner = match[1] // eg, triggerman722.
        const repo = match[2] // eg, colorstrap
        const format = match[3]
        const apiUrl = `http://www.codetally.com/formattedshield/${owner}/${repo}`
        const badgeData = getBadgeData('codetally', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            badgeData.text[1] = ` ${data.currency_sign}${data.amount} ${
              data.multiplier
            }`
            badgeData.colorscheme = null
            badgeData.colorB = '#2E8B57'
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
