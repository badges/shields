'use strict'

const queryString = require('query-string')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { fetchFromSvg } = require('../../lib/svg-badge-parser')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

module.exports = class CodacyCoverage extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/codacy\/coverage\/(?!grade\/)([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const projectId = match[1] // eg. e27821fb6289410b8f58338c7e0bc686
        const branch = match[2]
        const format = match[3]

        const queryParams = {}
        if (branch) {
          queryParams.branch = branch
        }
        const query = queryString.stringify(queryParams)
        const url =
          'https://api.codacy.com/project/badge/coverage/' +
          projectId +
          '?' +
          query
        const badgeData = getBadgeData('coverage', data)
        fetchFromSvg(request, url, (err, res) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            badgeData.text[1] = res
            badgeData.colorscheme = coveragePercentageColor(parseInt(res))
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
