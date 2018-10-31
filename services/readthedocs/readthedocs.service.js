'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { fetchFromSvg } = require('../../lib/svg-badge-parser')

module.exports = class ReadTheDocs extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/readthedocs\/([^/]+)(?:\/(.+))?.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const project = match[1]
        const version = match[2]
        const format = match[3]
        const badgeData = getBadgeData('docs', data)
        let url = `https://readthedocs.org/projects/${encodeURIComponent(
          project
        )}/badge/`
        if (version != null) {
          url += `?version=${encodeURIComponent(version)}`
        }
        fetchFromSvg(request, url, />([^<>]+)<\/text><\/g>/, (err, res) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            badgeData.text[1] = res
            if (res === 'passing') {
              badgeData.colorscheme = 'brightgreen'
            } else if (res === 'failing') {
              badgeData.colorscheme = 'red'
            } else if (res === 'unknown') {
              badgeData.colorscheme = 'yellow'
            } else {
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
