'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const {
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubSearch extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    // GitHub search hit counter.
    camp.route(
      /^\/github\/search\/([^/]+)\/([^/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1]
        const repo = match[2]
        const search = match[3]
        const format = match[4]
        const query = { q: search + ' repo:' + user + '/' + repo }
        const badgeData = getBadgeData(search + ' counter', data)
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
