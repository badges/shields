'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { metric } = require('../../lib/text-formatters')
const { addv: versionText } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')

module.exports = class DubDownload extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get url() {
    return {
      base: 'dub',
    }
  }

  static get examples() {
    return [
      {
        title: 'DUB',
        previewUrl: 'dd/vibe-d',
      },
      {
        title: 'DUB',
        previewUrl: 'dw/vibe-d',
      },
      {
        title: 'DUB',
        previewUrl: 'dm/vibe-d/latest',
      },
      {
        title: 'DUB',
        previewUrl: 'dt/vibe-d/0.8.4',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/dub\/(dd|dw|dm|dt)\/([^/]+)(?:\/([^/]+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // downloads (dd - daily, dw - weekly, dm - monthly, dt - total)
        const pkg = match[2] // package name, e.g. vibe-d
        const version = match[3] // version (1.2.3 or latest)
        const format = match[4]
        let apiUrl = `https://code.dlang.org/api/packages/${pkg}`
        if (version) {
          apiUrl += `/${version}`
        }
        apiUrl += '/stats'
        const badgeData = getBadgeData('dub', data)
        request(apiUrl, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            if (info.charAt(0) === 'd') {
              badgeData.text[0] = getLabel('downloads', data)
              let downloads
              switch (info.charAt(1)) {
                case 'm':
                  downloads = parsedData.downloads.monthly
                  badgeData.text[1] = `${metric(downloads)}/month`
                  break
                case 'w':
                  downloads = parsedData.downloads.weekly
                  badgeData.text[1] = `${metric(downloads)}/week`
                  break
                case 'd':
                  downloads = parsedData.downloads.daily
                  badgeData.text[1] = `${metric(downloads)}/day`
                  break
                case 't':
                  downloads = parsedData.downloads.total
                  badgeData.text[1] = metric(downloads)
                  break
              }
              if (version) {
                badgeData.text[1] += ` ${versionText(version)}`
              }
              badgeData.colorscheme = downloadCountColor(downloads)
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
