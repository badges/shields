'use strict'

const prettyBytes = require('pretty-bytes')
const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const {
  documentation,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class GithubRepoSize extends LegacyService {
  static get category() {
    return 'size'
  }

  static get route() {
    return {
      base: 'github/repo-size',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub repo size in bytes',
        previewUrl: 'badges/shields',
        keywords: ['GitHub', 'repo', 'size'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/repo-size\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1]
        const repo = match[2]
        const format = match[3]
        const apiUrl = `/repos/${user}/${repo}`
        const badgeData = getBadgeData('repo size', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            badgeData.text[1] = prettyBytes(parseInt(parsedData.size) * 1024)
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
