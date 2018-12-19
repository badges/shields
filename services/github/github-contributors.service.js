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

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class GithubContributors extends LegacyService {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'github/contributors',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub contributors',
        pattern: ':user/:repo',
        namedParams: {
          user: 'cdnjs',
          repo: 'cdnjs',
        },
        staticPreview: {
          label: 'contributors',
          message: '397',
          color: 'blue',
        },
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/contributors(-anon)?\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const isAnon = match[1]
        const user = match[2]
        const repo = match[3]
        const format = match[4]
        const apiUrl = `/repos/${user}/${repo}/contributors?page=1&per_page=1&anon=${!!isAnon}`
        const badgeData = getBadgeData('contributors', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            let contributors

            if (
              res.headers['link'] &&
              res.headers['link'].indexOf('rel="last"') !== -1
            ) {
              contributors = res.headers['link'].match(
                /[?&]page=(\d+)[^>]+>; rel="last"/
              )[1]
            } else {
              contributors = JSON.parse(buffer).length
            }

            badgeData.text[1] = metric(+contributors)
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
