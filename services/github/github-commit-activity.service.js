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
module.exports = class GithubCommitActivity extends LegacyService {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'github/commit-activity',
      pattern: ':interval(y|m|4w|w)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub commit activity',
        // Override the pattern to omit the deprecated interval "4w".
        pattern: ':interval(y|m|w)/:user/:repo',
        namedParams: { interval: 'm', user: 'eslint', repo: 'eslint' },
        staticPreview: {
          label: 'commit activity',
          message: '457/month',
          color: 'blue',
        },
        keywords: ['commits'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/commit-activity\/(y|m|4w|w)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
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
              case 'm':
                // To approximate the value for the past month, get the sum for the last
                // four weeks and add a weighted value for the fifth week.
                const fourWeeksValue = parsedData
                  .slice(-4)
                  .reduce((sum, weekInfo) => sum + weekInfo.total, 0)
                const fifthWeekValue = parsedData.slice(-5)[0].total
                const averageWeeksPerMonth = 365 / 12 / 7
                value =
                  fourWeeksValue +
                  Math.round((averageWeeksPerMonth - 4) * fifthWeekValue)
                intervalLabel = '/month'
                break
              case '4w':
                value = parsedData
                  .slice(-4)
                  .reduce((sum, weekInfo) => sum + weekInfo.total, 0)
                intervalLabel = '/four weeks'
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
