'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { makeLogo: getLogo } = require('../../lib/logos')
const { metric } = require('../../lib/text-formatters')
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
module.exports = class GithubStars extends LegacyService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'github/stars',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub stars',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        queryParams: { style: 'social' },
        staticPreview: {
          label: 'Stars',
          message: '7k',
          style: 'social',
        },
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
