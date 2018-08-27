'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const {
  metric,
  addv: versionText,
  maybePluralize,
} = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
  version: versionColor,
} = require('../../lib/color-formatters')

module.exports = class Hexpm extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/hexpm\/([^/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((queryParams, match, sendBadge, request) => {
        const info = match[1]
        const repo = match[2] // eg, `httpotion`.
        const format = match[3]
        const apiUrl = 'https://hex.pm/api/packages/' + repo
        const badgeData = getBadgeData('hex', queryParams)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            if (info.charAt(0) === 'd') {
              badgeData.text[0] = getLabel('downloads', queryParams)
              let downloads
              switch (info.charAt(1)) {
                case 'w':
                  downloads = data.downloads.week
                  badgeData.text[1] = metric(downloads) + '/week'
                  break
                case 'd':
                  downloads = data.downloads.day
                  badgeData.text[1] = metric(downloads) + '/day'
                  break
                case 't':
                  downloads = data.downloads.all
                  badgeData.text[1] = metric(downloads)
                  break
              }
              badgeData.colorscheme = downloadCountColor(downloads)
              sendBadge(format, badgeData)
            } else if (info === 'v') {
              const version = data.releases[0].version
              badgeData.text[1] = versionText(version)
              badgeData.colorscheme = versionColor(version)
              sendBadge(format, badgeData)
            } else if (info === 'l') {
              const license = (data.meta.licenses || []).join(', ')
              badgeData.text[0] = getLabel(
                maybePluralize('license', data.meta.licenses),
                queryParams
              )
              if (license === '') {
                badgeData.text[1] = 'Unknown'
              } else {
                badgeData.text[1] = license
                badgeData.colorscheme = 'blue'
              }
              sendBadge(format, badgeData)
            }
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
