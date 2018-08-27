'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class Discord extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/discord\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const serverID = match[1]
        const format = match[2]
        const apiUrl = `https://discordapp.com/api/guilds/${serverID}/widget.json`

        request(apiUrl, (err, res, buffer) => {
          const badgeData = getBadgeData('chat', data)
          if (res && res.statusCode === 404) {
            badgeData.text[1] = 'invalid server'
            sendBadge(format, badgeData)
            return
          }
          if (err != null || !res || res.statusCode !== 200) {
            badgeData.text[1] = 'inaccessible'
            if (res && res.headers['content-type'] === 'application/json') {
              try {
                const data = JSON.parse(buffer)
                if (data && typeof data.message === 'string') {
                  badgeData.text[1] = data.message.toLowerCase()
                }
              } catch (e) {}
            }
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            const members = Array.isArray(data.members) ? data.members : []
            badgeData.text[1] = members.length + ' online'
            badgeData.colorscheme = 'brightgreen'
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
