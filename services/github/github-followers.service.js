'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const {
  documentation,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubFollowers extends LegacyService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'github/followers',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub followers',
        previewUrl: 'espadrine',
        queryParams: { style: 'social', label: 'Follow' },
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/followers\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, qubyte
        const format = match[2]
        const apiUrl = `/users/${user}`
        const badgeData = getBadgeData('followers', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res, 'user not found')) {
            sendBadge(format, badgeData)
            return
          }
          try {
            badgeData.text[1] = JSON.parse(buffer).followers
            badgeData.colorscheme = null
            badgeData.colorB = '#4183C4'
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
