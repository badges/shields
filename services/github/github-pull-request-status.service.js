'use strict'

const countBy = require('lodash.countby')
const LegacyService = require('../legacy-service')
const {
  makeColorB,
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const {
  checkStateColor: githubCheckStateColor,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubPullRequestStatus extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/status\/(s|contexts)\/pulls\/([^/]+)\/([^/]+)\/(\d+)\.(svg|png|gif|jpg|json)$/,
      cache((queryParams, match, sendBadge, request) => {
        const [, which, owner, repo, number, format] = match
        const issueUri = `/repos/${owner}/${repo}/pulls/${number}`
        const badgeData = getBadgeData('checks', queryParams)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', queryParams)
        }
        githubApiProvider.request(request, issueUri, {}, (err, res, buffer) => {
          if (
            githubCheckErrorResponse(
              badgeData,
              err,
              res,
              'pull request or repo not found'
            )
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            const ref = parsedData.head.sha
            const statusUri = `/repos/${owner}/${repo}/commits/${ref}/status`
            githubApiProvider.request(
              request,
              statusUri,
              {},
              // eslint-disable-next-line handle-callback-err
              (err, res, buffer) => {
                try {
                  const parsedData = JSON.parse(buffer)
                  const state = (badgeData.text[1] = parsedData.state)
                  badgeData.colorscheme = null
                  badgeData.colorB = makeColorB(
                    githubCheckStateColor(state),
                    queryParams
                  )
                  switch (which) {
                    case 's':
                      badgeData.text[1] = state
                      break
                    case 'contexts': {
                      const counts = countBy(parsedData.statuses, 'state')
                      badgeData.text[1] = Object.keys(counts)
                        .map(k => `${counts[k]} ${k}`)
                        .join(', ')
                      break
                    }
                    default:
                      throw Error('Unreachable due to regex')
                  }
                  sendBadge(format, badgeData)
                } catch (e) {
                  badgeData.text[1] = 'invalid'
                  sendBadge(format, badgeData)
                }
              }
            )
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
