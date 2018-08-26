'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

module.exports = class Jitpack extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/jitpack\/v\/([^/]*)\/([^/]*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const groupId = 'com.github.' + match[1] // github user
        const artifactId = match[2] // the project's name
        const format = match[3] // "svg"
        const name = 'JitPack'

        const pkg = groupId + '/' + artifactId + '/latest'
        const apiUrl = 'https://jitpack.io/api/builds/' + pkg

        const badgeData = getBadgeData(name, data)

        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          if (res.statusCode === 404) {
            badgeData.text[1] = 'not found'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            const status = data['status']
            let color = versionColor(data['version'])
            let version = versionText(data['version'])
            if (status !== 'ok') {
              color = 'red'
              version = 'unknown'
            }
            badgeData.text[1] = version
            badgeData.colorscheme = color
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
