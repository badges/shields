'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const {
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubRelease extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/release\/([^/]+\/[^/]+)(?:\/(all))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const userRepo = match[1] // eg, qubyte/rubidium
        const allReleases = match[2]
        const format = match[3]
        let apiUrl = `/repos/${userRepo}/releases`
        if (allReleases === undefined) {
          apiUrl = apiUrl + '/latest'
        }
        const badgeData = getBadgeData('release', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            let data = JSON.parse(buffer)
            if (allReleases === 'all') {
              data = data[0]
            }
            const version = data.tag_name
            const prerelease = data.prerelease
            badgeData.text[1] = versionText(version)
            badgeData.colorscheme = prerelease ? 'orange' : 'blue'
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'none'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
