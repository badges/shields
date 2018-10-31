'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

// For Coverity Code Advisor On Demand.
module.exports = class CoverityOnDemand extends LegacyService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'coverity/ondemand',
    }
  }

  static get examples() {
    return [
      {
        title: 'Coverity Code Advisor On Demand Stream',
        previewUrl: 'streams/STREAM',
      },
      {
        title: 'Coverity Code Advisor On Demand Job',
        previewUrl: 'jobs/JOB',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/coverity\/ondemand\/(.+)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const badgeType = match[1] // One of the strings "streams" or "jobs"
        const badgeTypeId = match[2] // streamId or jobId
        const format = match[3]

        const badgeData = getBadgeData('coverity', data)
        if (
          (badgeType === 'jobs' && badgeTypeId === 'JOB') ||
          (badgeType === 'streams' && badgeTypeId === 'STREAM')
        ) {
          // Request is for a static demo badge
          badgeData.text[1] = 'clean'
          badgeData.colorscheme = 'green'
          sendBadge(format, badgeData)
        } else {
          //
          // Request is for a real badge; send request to Coverity On Demand API
          // server to get the badge
          //
          // Example URLs for requests sent to Coverity On Demand are:
          //
          // https://api.ondemand.coverity.com/streams/44b25sjc9l3ntc2ngfi29tngro/badge
          // https://api.ondemand.coverity.com/jobs/p4tmm8031t4i971r0im4s7lckk/badge
          //
          const url =
            'https://api.ondemand.coverity.com/' +
            badgeType +
            '/' +
            badgeTypeId +
            '/badge'
          request(url, (err, res, buffer) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }
            try {
              const data = JSON.parse(buffer)
              sendBadge(format, data)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          })
        }
      })
    )
  }
}
