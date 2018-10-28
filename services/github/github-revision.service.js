'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const {
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubRevision extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/revision\/([^/]+)\/([^/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, Ang-YC
        const repo = match[2] // eg, wx-voice
        const path = match[3] // eg, README.md
        const format = match[4]

        const apiUrl = `/repos/${user}/${repo}/commits?page=1&per_page=1&path=${path}`
        const badgeData = getBadgeData('revision', data)

        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }

        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res, 'repo not found')) {
            sendBadge(format, badgeData)
            return
          }
          try {
            let revision

            if (
              res.headers['link'] &&
              res.headers['link'].indexOf('rel="last"') !== -1
            ) {
              revision = res.headers['link'].match(
                /[?&]page=(\d+)[^>]+>; rel="last"/
              )[1]
            } else {
              revision = JSON.parse(buffer).length
            }

            badgeData.text[1] = metric(+revision)
            badgeData.colorscheme = 'blue'
          } catch (e) {
            badgeData.text[1] = 'inaccessible'
          }
          sendBadge(format, badgeData)
        })
      })
    )
  }
}
