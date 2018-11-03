'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

// TeamCity CodeBetter code coverage.
module.exports = class TeamcityCoverage extends LegacyService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'teamcity/coverage',
    }
  }

  static get examples() {
    return [
      {
        title: 'TeamCity CodeBetter Coverage',
        previewUrl: 'bt428',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/teamcity\/coverage\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const buildType = match[1] // eg, `bt428`.
        const format = match[2]
        const apiUrl = `http://teamcity.codebetter.com/app/rest/builds/buildType:(id:${buildType})/statistics?guest=1`
        const badgeData = getBadgeData('coverage', data)
        request(
          apiUrl,
          { headers: { Accept: 'application/json' } },
          (err, res, buffer) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }
            try {
              const data = JSON.parse(buffer)
              let covered
              let total

              data.property.forEach(property => {
                if (property.name === 'CodeCoverageAbsSCovered') {
                  covered = property.value
                } else if (property.name === 'CodeCoverageAbsSTotal') {
                  total = property.value
                }
              })

              if (covered === undefined || total === undefined) {
                badgeData.text[1] = 'malformed'
                sendBadge(format, badgeData)
                return
              }

              const percentage = (covered / total) * 100
              badgeData.text[1] = `${percentage.toFixed(0)}%`
              badgeData.colorscheme = coveragePercentageColor(percentage)
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
