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

module.exports = class GithubCommitActivity extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github/commit-activity',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub commit activity the past week, 4 weeks, year',
        previewUrl: 'y/eslint/eslint',
        keywords: ['GitHub', 'commit', 'commits', 'activity'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/commit-activity\/(y|4w|w)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const interval = match[1]
        const user = match[2]
        const repo = match[3]
        const format = match[4]
        const apiUrl = `/repos/${user}/${repo}/stats/commit_activity`
        const badgeData = getBadgeData('commit activity', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
          badgeData.links = [`https://github.com/${user}/${repo}`]
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            let value
            let intervalLabel
            switch (interval) {
              case 'y':
                value = parsedData.reduce(
                  (sum, weekInfo) => sum + weekInfo.total,
                  0
                )
                intervalLabel = '/year'
                break
              case '4w':
                value = parsedData
                  .slice(-4)
                  .reduce((sum, weekInfo) => sum + weekInfo.total, 0)
                intervalLabel = '/4 weeks'
                break
              case 'w':
                value = parsedData.slice(-2)[0].total
                intervalLabel = '/week'
                break
              default:
                throw Error('Unhandled case')
            }
            badgeData.text[1] = `${metric(value)}${intervalLabel}`
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
