'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const serverSecrets = require('../../lib/server-secrets')
const { metric } = require('../text-formatters')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../color-formatters')

class SonarqubeCoverage extends LegacyService {
  static get category() {
    return 'coverage'
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: '',
    }
  }

  static get examples() {
    return [
      {
        title: 'SonarQube coverage',
        pattern: ':scheme(http|https)/:host/:buildType/:metricName',
        namedParams: {
          scheme: 'http',
          host: 'sonar.petalslink.com',
          buildType: 'org.ow2.petals:petals-se-ase',
          metricName: 'coverage',
        },
        staticPreview: {
          label: 'coverage',
          message: '63%',
          color: 'yellow',
        },
      },
      {
        title: 'SonarQube coverage (legacy API)',
        pattern: ':apiVersion/:scheme(http|https)/:host/:buildType/:metricName',
        namedParams: {
          apiVersion: '4.2',
          scheme: 'http',
          host: 'sonar.petalslink.com',
          buildType: 'org.ow2.petals:petals-se-ase',
          metricName: 'coverage',
        },
        staticPreview: {
          label: 'coverage',
          message: '63%',
          color: 'yellow',
        },
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
class Sonarqube extends LegacyService {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: '',
    }
  }

  static get examples() {
    return [
      {
        title: 'SonarQube tech debt',
        pattern: ':scheme(http|https)/:host/:buildType/:metricName',
        namedParams: {
          scheme: 'http',
          host: 'sonar.petalslink.com',
          buildType: 'org.ow2.petals:petals-se-ase',
          metricName: 'tech_debt',
        },
        staticPreview: {
          label: 'tech debt',
          message: '2%',
          color: 'brightgreen',
        },
      },
      {
        title: 'SonarQube tech debt (legacy API)',
        pattern: ':apiVersion/:scheme(http|https)/:host/:buildType/:metricName',
        namedParams: {
          apiVersion: '4.2',
          scheme: 'http',
          host: 'sonar.petalslink.com',
          buildType: 'org.ow2.petals:petals-se-ase',
          metricName: 'tech_debt',
        },
        staticPreview: {
          label: 'tech debt',
          message: '2%',
          color: 'brightgreen',
        },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/sonar\/?([0-9.]+)?\/(http|https)\/(.*)\/(.*)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const version = parseFloat(match[1])
        const scheme = match[2]
        const serverUrl = match[3]
        const buildType = match[4]
        const metricName = match[5]
        const format = match[6]

        let sonarMetricName = metricName
        if (metricName === 'tech_debt') {
          //special condition for backwards compatibility
          sonarMetricName = 'sqale_debt_ratio'
        }

        const useLegacyApi = !!version && version < 5.4

        const uri = useLegacyApi
          ? `${scheme}://${serverUrl}/api/resources?resource=${buildType}&depth=0&metrics=${encodeURIComponent(
              sonarMetricName
            )}&includetrends=true`
          : `${scheme}://${serverUrl}/api/measures/component?componentKey=${buildType}&metricKeys=${encodeURIComponent(
              sonarMetricName
            )}`

        const options = {
          uri,
          headers: {
            Accept: 'application/json',
          },
        }
        if (serverSecrets.sonarqube_token) {
          options.auth = {
            user: serverSecrets.sonarqube_token,
          }
        }

        const badgeData = getBadgeData(metricName.replace(/_/g, ' '), data)

        request(options, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)

            const value = parseInt(
              useLegacyApi
                ? data[0].msr[0].val
                : data.component.measures[0].value
            )

            if (value === undefined) {
              badgeData.text[1] = 'unknown'
              sendBadge(format, badgeData)
              return
            }

            if (metricName.indexOf('coverage') !== -1) {
              badgeData.text[1] = `${value.toFixed(0)}%`
              badgeData.colorscheme = coveragePercentageColor(value)
            } else if (/^\w+_violations$/.test(metricName)) {
              badgeData.text[1] = value
              badgeData.colorscheme = 'brightgreen'
              if (value > 0) {
                if (metricName === 'blocker_violations') {
                  badgeData.colorscheme = 'red'
                } else if (metricName === 'critical_violations') {
                  badgeData.colorscheme = 'orange'
                } else if (metricName === 'major_violations') {
                  badgeData.colorscheme = 'yellow'
                } else if (metricName === 'minor_violations') {
                  badgeData.colorscheme = 'yellowgreen'
                } else if (metricName === 'info_violations') {
                  badgeData.colorscheme = 'green'
                }
              }
            } else if (metricName === 'fortify-security-rating') {
              badgeData.text[1] = `${value}/5`

              if (value === 0) {
                badgeData.colorscheme = 'red'
              } else if (value === 1) {
                badgeData.colorscheme = 'orange'
              } else if (value === 2) {
                badgeData.colorscheme = 'yellow'
              } else if (value === 3) {
                badgeData.colorscheme = 'yellowgreen'
              } else if (value === 4) {
                badgeData.colorscheme = 'green'
              } else if (value === 5) {
                badgeData.colorscheme = 'brightgreen'
              } else {
                badgeData.colorscheme = 'lightgrey'
              }
            } else if (
              metricName === 'sqale_debt_ratio' ||
              metricName === 'tech_debt' ||
              metricName === 'public_documented_api_density'
            ) {
              // colors are based on sonarqube default rating grid and display colors
              // [0,0.1)   ==> A (green)
              // [0.1,0.2) ==> B (yellowgreen)
              // [0.2,0.5) ==> C (yellow)
              // [0.5,1)   ==> D (orange)
              // [1,)      ==> E (red)
              let colorValue = value
              if (metricName === 'public_documented_api_density') {
                //Some metrics higher % is better
                colorValue = 100 - value
              }
              badgeData.text[1] = `${value}%`
              if (colorValue >= 100) {
                badgeData.colorscheme = 'red'
              } else if (colorValue >= 50) {
                badgeData.colorscheme = 'orange'
              } else if (colorValue >= 20) {
                badgeData.colorscheme = 'yellow'
              } else if (colorValue >= 10) {
                badgeData.colorscheme = 'yellowgreen'
              } else if (colorValue >= 0) {
                badgeData.colorscheme = 'brightgreen'
              } else {
                badgeData.colorscheme = 'lightgrey'
              }
            } else {
              badgeData.text[1] = metric(value)
              badgeData.colorscheme = 'brightgreen'
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

module.exports = {
  SonarqubeCoverage,
  Sonarqube,
}
