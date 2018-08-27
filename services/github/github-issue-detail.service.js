'use strict'

const LegacyService = require('../legacy-service')
const {
  makeColorB,
  makeLabel: getLabel,
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { formatDate } = require('../../lib/text-formatters')
const { age: ageColor } = require('../../lib/color-formatters')
const {
  stateColor: githubStateColor,
  commentsColor: githubCommentsColor,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubIssueDetail extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/(?:issues|pulls)\/detail\/(s|title|u|label|comments|age|last-update)\/([^/]+)\/([^/]+)\/(\d+)\.(svg|png|gif|jpg|json)$/,
      cache((queryParams, match, sendBadge, request) => {
        const [, which, owner, repo, number, format] = match
        const uri = `/repos/${owner}/${repo}/issues/${number}`
        const badgeData = getBadgeData(
          `issue/pull request ${number}`,
          queryParams
        )
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', queryParams)
        }
        githubApiProvider.request(request, uri, {}, (err, res, buffer) => {
          if (
            githubCheckErrorResponse(
              badgeData,
              err,
              res,
              'issue, pull request or repo not found'
            )
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            const isPR = 'pull_request' in parsedData
            const noun = isPR ? 'pull request' : 'issue'
            badgeData.text[0] = getLabel(
              `${noun} ${parsedData.number}`,
              queryParams
            )
            switch (which) {
              case 's': {
                const state = (badgeData.text[1] = parsedData.state)
                badgeData.colorscheme = null
                badgeData.colorB = makeColorB(
                  githubStateColor(state),
                  queryParams
                )
                break
              }
              case 'title':
                badgeData.text[1] = parsedData.title
                break
              case 'u':
                badgeData.text[0] = getLabel('author', queryParams)
                badgeData.text[1] = parsedData.user.login
                break
              case 'label':
                badgeData.text[0] = getLabel('label', queryParams)
                badgeData.text[1] = parsedData.labels
                  .map(i => i.name)
                  .join(' | ')
                if (parsedData.labels.length === 1) {
                  badgeData.colorscheme = null
                  badgeData.colorB = makeColorB(
                    parsedData.labels[0].color,
                    queryParams
                  )
                }
                break
              case 'comments': {
                badgeData.text[0] = getLabel('comments', queryParams)
                const comments = (badgeData.text[1] = parsedData.comments)
                badgeData.colorscheme = null
                badgeData.colorB = makeColorB(
                  githubCommentsColor(comments),
                  queryParams
                )
                break
              }
              case 'age':
              case 'last-update': {
                const label = which === 'age' ? 'created' : 'updated'
                const date =
                  which === 'age'
                    ? parsedData.created_at
                    : parsedData.updated_at
                badgeData.text[0] = getLabel(label, queryParams)
                badgeData.text[1] = formatDate(date)
                badgeData.colorscheme = ageColor(Date.parse(date))
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
        })
      })
    )
  }
}
