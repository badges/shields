'use strict'

const queryString = require('query-string')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

module.exports = class ___ extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    // Codecov integration.
    camp.route(
      /^\/codecov\/c\/(?:token\/(\w+))?[+/]?([^/]+\/[^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const token = match[1]
        const userRepo = match[2] // eg, `github/codecov/example-python`.
        const branch = match[3]
        const format = match[4]
        let apiUrl
        if (branch) {
          apiUrl = `https://codecov.io/${userRepo}/branch/${branch}/graphs/badge.txt`
        } else {
          apiUrl = `https://codecov.io/${userRepo}/graphs/badge.txt`
        }
        if (token) {
          apiUrl += '?' + queryString.stringify({ token })
        }
        const badgeData = getBadgeData('coverage', data)
        request(apiUrl, (err, res, body) => {
          if (err != null) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
            return
          }
          try {
            // Body: range(0, 100) or "unknown"
            const coverage = body.trim()
            if (Number.isNaN(+coverage)) {
              badgeData.text[1] = 'unknown'
              sendBadge(format, badgeData)
              return
            }
            badgeData.text[1] = coverage + '%'
            badgeData.colorscheme = coveragePercentageColor(coverage)
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'malformed'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
