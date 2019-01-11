'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
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
module.exports = class GithubSearch extends LegacyService {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'github/search',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub search hit counter',
        previewUrl: 'torvalds/linux/goto',
        keywords: ['GitHub', 'search', 'hit', 'counter'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/search\/([^/]+)\/([^/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1]
        const repo = match[2]
        const search = match[3]
        const format = match[4]
        const query = { q: `${search} repo:${user}/${repo}` }
        const badgeData = getBadgeData(`${search} counter`, data)
        githubApiProvider.request(
          request,
          '/search/code',
          query,
          (err, res, buffer) => {
            if (githubCheckErrorResponse(badgeData, err, res)) {
              sendBadge(format, badgeData)
              return
            }
            try {
              const body = JSON.parse(buffer)
              badgeData.text[1] = metric(body.total_count)
              badgeData.colorscheme = 'blue'
              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          }
        )
      })
    )
  }
}
