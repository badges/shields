'use strict'

const queryString = require('query-string')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { fetchFromSvg } = require('../../lib/svg-badge-parser')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

module.exports = class CodacyCoverage extends LegacyService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'codacy',
    }
  }

  static get examples() {
    return [
      {
        title: 'Codacy coverage',
        previewUrl: 'coverage/59d607d0e311408885e418004068ea58',
      },
      {
        title: 'Codacy branch coverage',
        previewUrl: 'coverage/59d607d0e311408885e418004068ea58/master',
      },
    ]
  }

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
        const url = `https://api.codacy.com/project/badge/coverage/${projectId}?${query}`
        const badgeData = getBadgeData('coverage', data)
        fetchFromSvg(
          request,
          url,
          /text-anchor="middle">([^<>]+)<\/text>/,
          (err, res) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }
            try {
              const coverage = parseInt(res)
              if (Number.isNaN(coverage)) {
                badgeData.text[1] = 'unknown'
              } else {
                badgeData.text[1] = res
                badgeData.colorscheme = coveragePercentageColor(coverage)
              }
              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          }
        )
      })
    )
  }
}
