'use strict'

const LegacyService = require('../legacy-service')
const { fetchFromSvg } = require('../../lib/svg-badge-parser')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

// For Visual Studio Team Services build.
module.exports = class Vso extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/vso\/build\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const name = match[1] // User name
        const project = match[2] // Project ID, e.g. 953a34b9-5966-4923-a48a-c41874cfb5f5
        const build = match[3] // Build definition ID, e.g. 1
        const format = match[4]
        const url =
          'https://' +
          name +
          '.visualstudio.com/DefaultCollection/_apis/public/build/definitions/' +
          project +
          '/' +
          build +
          '/badge'
        const badgeData = getBadgeData('build', data)
        fetchFromSvg(request, url, (err, res) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            badgeData.text[1] = res.toLowerCase()
            if (res === 'succeeded') {
              badgeData.colorscheme = 'brightgreen'
              badgeData.text[1] = 'passing'
            } else if (res === 'failed') {
              badgeData.colorscheme = 'red'
              badgeData.text[1] = 'failing'
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
