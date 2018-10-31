'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { metric } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')

module.exports = class CocoapodsDownloads extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get url() {
    return {
      base: 'cocoapods',
    }
  }

  static get examples() {
    return [
      {
        title: 'CocoaPods',
        previewUrl: 'dt/AFNetworking',
      },
      {
        title: 'CocoaPods',
        previewUrl: 'dm/AFNetworking',
      },
      {
        title: 'CocoaPods',
        previewUrl: 'dw/AFNetworking',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/cocoapods\/(dm|dw|dt)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // One of these: "dm", "dw", "dt"
        const spec = match[2] // eg, AFNetworking
        const format = match[3]
        const apiUrl = 'https://metrics.cocoapods.org/api/v1/pods/' + spec
        const badgeData = getBadgeData('downloads', data)
        request(apiUrl, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            let downloads = 0
            switch (info.charAt(1)) {
              case 'm':
                downloads = data.stats.download_month
                badgeData.text[1] = metric(downloads) + '/month'
                break
              case 'w':
                downloads = data.stats.download_week
                badgeData.text[1] = metric(downloads) + '/week'
                break
              case 't':
                downloads = data.stats.download_total
                badgeData.text[1] = metric(downloads)
                break
            }
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
