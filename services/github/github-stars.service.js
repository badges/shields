'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const {
  documentation,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubStars extends LegacyService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'github/stars',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub stars',
        previewUrl: 'badges/shields',
        query: { style: 'social', label: 'Stars' },
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/stars\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, qubyte/rubidium
        const repo = match[2]
        const format = match[3]
        const apiUrl = `/repos/${user}/${repo}`
        const badgeData = getBadgeData('stars', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
          badgeData.links = [
            `https://github.com/${user}/${repo}`,
            `https://github.com/${user}/${repo}/stargazers`,
          ]
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            badgeData.text[1] = metric(JSON.parse(buffer).stargazers_count)
            badgeData.colorscheme = 'blue'
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
