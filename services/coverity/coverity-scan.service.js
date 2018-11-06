'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class CoverityScan extends LegacyService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'coverity/scan',
    }
  }

  static get examples() {
    return [
      {
        title: 'Coverity Scan',
        previewUrl: '3997',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/coverity\/scan\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const projectId = match[1] // eg, `3997`
        const format = match[2]
        const url = `https://scan.coverity.com/projects/${projectId}/badge.json`
        const badgeData = getBadgeData('coverity', data)
        request(url, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            badgeData.text[1] = data.message

            if (data.message === 'passed') {
              badgeData.colorscheme = 'brightgreen'
              badgeData.text[1] = 'passing'
            } else if (/^passed .* new defects$/.test(data.message)) {
              badgeData.colorscheme = 'yellow'
            } else if (data.message === 'pending') {
              badgeData.colorscheme = 'orange'
            } else if (data.message === 'failed') {
              badgeData.colorscheme = 'red'
            }
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
