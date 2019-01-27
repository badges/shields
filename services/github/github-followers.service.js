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
module.exports = class GithubFollowers extends LegacyService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'github/followers',
      pattern: ':user',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub followers',
        previewUrl: 'espadrine',
        // https://github.com/badges/shields/issues/2479
        // namedParams: {
        //   user: 'espadrine',
        // },
        // staticPreview: {
        //   label: 'Follow',
        //   message: '150',
        //   style: 'social',
        // },
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
