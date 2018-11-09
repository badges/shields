'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { metric } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')

module.exports = class CocoapodsApps extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'cocoapods',
    }
  }

  static get examples() {
    return [
      {
        title: 'Cocoapods apps',
        previewUrl: 'at/AFNetworking',
      },
      {
        title: 'Cocoapods apps',
        previewUrl: 'aw/AFNetworking',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/cocoapods\/(aw|at)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // One of these: "aw", "at"
        const spec = match[2] // eg, AFNetworking
        const format = match[3]
        const apiUrl = `https://metrics.cocoapods.org/api/v1/pods/${spec}`
        const badgeData = getBadgeData('apps', data)
        request(apiUrl, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            let apps = 0
            switch (info.charAt(1)) {
              case 'w':
                apps = data.stats.app_week
                badgeData.text[1] = `${metric(apps)}/week`
                break
              case 't':
                apps = data.stats.app_total
                badgeData.text[1] = metric(apps)
                break
            }
            badgeData.colorscheme = downloadCountColor(apps)
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
