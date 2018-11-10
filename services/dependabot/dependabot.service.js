'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')

module.exports = class DependabotSemverCompatibility extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'dependabot/semver',
    }
  }

  static get examples() {
    return [
      {
        title: 'SemVer Compatibility',
        previewUrl: 'bundler/puma',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/dependabot\/semver\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const packageManager = match[1]
        const dependencyName = match[2]
        const format = match[3]
        const options = {
          method: 'GET',
          headers: { Accept: 'application/json' },
          uri: `https://api.dependabot.com/badges/compatibility_score?package-manager=${packageManager}&dependency-name=${dependencyName}&version-scheme=semver`,
        }
        const badgeData = getBadgeData('semver stability', data)
        badgeData.links = [
          `https://dependabot.com/compatibility-score.html?package-manager=${packageManager}&dependency-name=${dependencyName}&version-scheme=semver`,
        ]
        badgeData.logo = getLogo('dependabot', data)
        request(options, (err, res) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const dependabotData = JSON.parse(res['body'])
            badgeData.text[1] = dependabotData.status
            badgeData.colorscheme = dependabotData.colour
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            badgeData.colorscheme = 'red'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
