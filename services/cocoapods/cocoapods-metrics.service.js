'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class CocoapodsMetrics extends LegacyService {
  static get category() {
    return 'quality'
  }

  static get route() {
    return {
      title: 'Cocoapods doc percentage',
      base: 'cocoapods/metrics/doc-percent',
    }
  }

  static get examples() {
    return [
      {
        previewUrl: 'AFNetworking',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/cocoapods\/metrics\/doc-percent\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const spec = match[1] // eg, AFNetworking
        const format = match[2]
        const apiUrl = `https://metrics.cocoapods.org/api/v1/pods/${spec}`
        const badgeData = getBadgeData('docs', data)
        request(apiUrl, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            let percentage = parsedData.cocoadocs.doc_percent
            if (percentage == null) {
              percentage = 0
            }
            badgeData.colorscheme = coveragePercentageColor(percentage)
            badgeData.text[1] = `${percentage}%`
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
