'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const {
  coveragePercentage: coveragePercentageColor,
  letterScore: letterScoreColor,
  colorScale,
} = require('../../lib/color-formatters')

module.exports = class Codeclimate extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/codeclimate(\/(c|coverage|maintainability|issues|tech-debt)(-letter|-percentage)?)?\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        let type
        if (match[2] === 'c' || !match[2]) {
          // Top-level and /coverage URLs equivalent to /c, still supported for backwards compatibility. See #1387.
          type = 'coverage'
        } else if (match[2] === 'tech-debt') {
          type = 'technical debt'
        } else {
          type = match[2]
        }
        // For maintainability, default is letter, alternative is percentage. For coverage, default is percentage, alternative is letter.
        const isAlternativeFormat = match[3]
        const userRepo = match[4] // eg, `twbs/bootstrap`.
        const format = match[5]
        request(
          {
            method: 'GET',
            uri: `https://api.codeclimate.com/v1/repos?github_slug=${userRepo}`,
            json: true,
          },
          (err, res, body) => {
            const badgeData = getBadgeData(type, data)
            if (err != null) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
              return
            }

            try {
              if (!body.data || body.data.length === 0) {
                badgeData.text[1] = 'not found'
                sendBadge(format, badgeData)
                return
              }

              const branchData =
                type === 'coverage'
                  ? body.data[0].relationships.latest_default_branch_test_report
                      .data
                  : body.data[0].relationships.latest_default_branch_snapshot
                      .data
              if (branchData == null) {
                badgeData.text[1] = 'unknown'
                sendBadge(format, badgeData)
                return
              }

              const url = `https://api.codeclimate.com/v1/repos/${
                body.data[0].id
              }/${type === 'coverage' ? 'test_reports' : 'snapshots'}/${
                branchData.id
              }`
              request(url, (err, res, buffer) => {
                if (err != null) {
                  badgeData.text[1] = 'invalid'
                  sendBadge(format, badgeData)
                  return
                }

                try {
                  const parsedData = JSON.parse(buffer)
                  if (type === 'coverage' && isAlternativeFormat) {
                    const score = parsedData.data.attributes.rating.letter
                    badgeData.text[1] = score
                    badgeData.colorscheme = letterScoreColor(score)
                  } else if (type === 'coverage') {
                    const percentage = parseFloat(
                      parsedData.data.attributes.covered_percent
                    )
                    badgeData.text[1] = `${percentage.toFixed(0)}%`
                    badgeData.colorscheme = coveragePercentageColor(percentage)
                  } else if (type === 'issues') {
                    const count = parsedData.data.meta.issues_count
                    badgeData.text[1] = count
                    badgeData.colorscheme = colorScale(
                      [1, 5, 10, 20],
                      ['brightgreen', 'green', 'yellowgreen', 'yellow', 'red']
                    )(count)
                  } else if (type === 'technical debt') {
                    const percentage = parseFloat(
                      parsedData.data.attributes.ratings[0].measure.value
                    )
                    badgeData.text[1] = `${percentage.toFixed(0)}%`
                    badgeData.colorscheme = colorScale(
                      [5, 10, 20, 50],
                      ['brightgreen', 'green', 'yellowgreen', 'yellow', 'red']
                    )(percentage)
                  } else if (
                    type === 'maintainability' &&
                    isAlternativeFormat
                  ) {
                    // maintainability = 100 - technical debt
                    const percentage =
                      100 -
                      parseFloat(
                        parsedData.data.attributes.ratings[0].measure.value
                      )
                    badgeData.text[1] = `${percentage.toFixed(0)}%`
                    badgeData.colorscheme = colorScale(
                      [50, 80, 90, 95],
                      ['red', 'yellow', 'yellowgreen', 'green', 'brightgreen']
                    )(percentage)
                  } else if (type === 'maintainability') {
                    const score = parsedData.data.attributes.ratings[0].letter
                    badgeData.text[1] = score
                    badgeData.colorscheme = letterScoreColor(score)
                  }
                  sendBadge(format, badgeData)
                } catch (e) {
                  badgeData.text[1] = 'invalid'
                  sendBadge(format, badgeData)
                }
              })
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          }
        )
      })
    )
  }

  static get route() {
    return {
      base: 'codeclimate',
    }
  }

  static get category() {
    return 'build'
  }

  static get examples() {
    return [
      {
        title: 'Code Climate issues',
        exampleUrl: 'issues/twbs/bootstrap',
        pattern: 'issues/:userRepo',
        staticExample: { label: 'issues', message: '89', color: 'red' },
      },
      {
        title: 'Code Climate maintainability',
        exampleUrl: 'maintainability/angular/angular.js',
        pattern: 'maintainability/:userRepo',
        staticExample: { label: 'maintainability', message: 'F', color: 'red' },
      },
      {
        title: 'Code Climate maintainability (percentage)',
        exampleUrl: 'maintainability-percentage/angular/angular.js',
        pattern: 'maintainability-percentage/:userRepo',
        staticExample: {
          label: 'maintainability',
          message: '4.6%',
          color: 'red',
        },
      },
      {
        title: 'Code Climate coverage',
        exampleUrl: 'coverage/jekyll/jekyll',
        pattern: 'coverage/:userRepo',
        staticExample: {
          label: 'coverage',
          message: '95%',
          color: 'green',
        },
      },
      {
        title: 'Code Climate coverage (letter)',
        exampleUrl: 'coverage-letter/jekyll/jekyll',
        pattern: 'coverage-letter/:userRepo',
        staticExample: {
          label: 'coverage',
          message: 'A',
          color: 'brightgreen',
        },
      },
      {
        title: 'Code Climate technical debt',
        exampleUrl: 'tech-debt/jekyll/jekyll',
        pattern: 'tech-debt/:userRepo',
        staticExample: {
          label: 'technical debt',
          message: '3%',
          color: 'brightgreen',
        },
      },
    ]
  }
}
