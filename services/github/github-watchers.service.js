'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { makeLogo: getLogo } = require('../../lib/logos')
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
module.exports = class GithubWatchers extends LegacyService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'github/watchers',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub watchers',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: {
          label: 'Watch',
          message: '96',
          style: 'social',
        },
        queryParams: { label: 'Watch' },
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      namedLogo: 'github',
    }
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/watchers\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, qubyte/rubidium
        const repo = match[2]
        const format = match[3]
        const apiUrl = `/repos/${user}/${repo}`
        const badgeData = getBadgeData('watchers', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
          badgeData.links = [
            `https://github.com/${user}/${repo}`,
            `https://github.com/${user}/${repo}/watchers`,
          ]
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            badgeData.text[1] = JSON.parse(buffer).subscribers_count
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
