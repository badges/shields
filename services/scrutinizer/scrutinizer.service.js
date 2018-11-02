'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

module.exports = class Scrutinizer extends LegacyService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'scrutinizer',
    }
  }

  static get examples() {
    return [
      {
        title: 'Scrutinizer',
        previewUrl: 'g/filp/whoops',
      },
      {
        title: 'Scrutinizer Coverage',
        previewUrl: 'coverage/g/filp/whoops',
      },
      {
        title: 'Scrutinizer branch',
        previewUrl: 'coverage/g/doctrine/doctrine2/master',
      },
      {
        title: 'Scrutinizer Build',
        previewUrl: 'build/g/filp/whoops',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/scrutinizer(?:\/(build|coverage))?\/([^/]+\/[^/]+\/[^/]+|gp\/[^/])(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1] ? match[1] : 'code quality'
        const repo = match[2] // eg, g/phpmyadmin/phpmyadmin
        let branch = match[3]
        const format = match[4]
        const apiUrl = `https://scrutinizer-ci.com/api/repositories/${repo}`
        const badgeData = getBadgeData(type, data)
        request(apiUrl, {}, (err, res, buffer) => {
          if (
            checkErrorResponse(badgeData, err, res, {
              404: 'project or branch not found',
            })
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            // Which branch are we dealing with?
            if (branch === undefined) {
              branch = parsedData.default_branch
            }
            if (type === 'coverage') {
              const percentage =
                parsedData.applications[branch].index._embedded.project
                  .metric_values['scrutinizer.test_coverage'] * 100
              if (isNaN(percentage)) {
                badgeData.text[1] = 'unknown'
                badgeData.colorscheme = 'gray'
              } else {
                badgeData.text[1] = `${percentage.toFixed(0)}%`
                badgeData.colorscheme = coveragePercentageColor(percentage)
              }
            } else if (type === 'build') {
              const status = parsedData.applications[branch].build_status.status
              badgeData.text[1] = status
              if (status === 'passed') {
                badgeData.colorscheme = 'brightgreen'
                badgeData.text[1] = 'passing'
              } else if (status === 'failed' || status === 'error') {
                badgeData.colorscheme = 'red'
              } else if (status === 'pending') {
                badgeData.colorscheme = 'orange'
              }
            } else {
              let score =
                parsedData.applications[branch].index._embedded.project
                  .metric_values['scrutinizer.quality']
              score = Math.round(score * 100) / 100
              badgeData.text[1] = score
              if (score > 9) {
                badgeData.colorscheme = 'brightgreen'
              } else if (score > 7) {
                badgeData.colorscheme = 'green'
              } else if (score > 5) {
                badgeData.colorscheme = 'yellow'
              } else if (score > 4) {
                badgeData.colorscheme = 'orange'
              } else {
                badgeData.colorscheme = 'red'
              }
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
