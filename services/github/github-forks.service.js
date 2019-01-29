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
module.exports = class GithubForks extends LegacyService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'github/forks',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub forks',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: {
          label: 'Fork',
          message: '1639',
          style: 'social',
        },
        queryParams: { label: 'Fork' },
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
      /^\/github\/forks\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, qubyte/rubidium
        const repo = match[2]
        const format = match[3]
        const apiUrl = `/repos/${user}/${repo}`
        const badgeData = getBadgeData('forks', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
          badgeData.links = [
            `https://github.com/${user}/${repo}/fork`,
            `https://github.com/${user}/${repo}/network`,
          ]
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            const forks = data.forks_count
            badgeData.text[1] = forks
            badgeData.colorscheme = undefined
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
