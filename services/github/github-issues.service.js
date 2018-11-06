'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const {
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubIssues extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/issues(-pr)?(-closed)?(-raw)?\/(?!detail)([^/]+)\/([^/]+)\/?(.+)?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const isPR = !!match[1]
        const isClosed = !!match[2]
        const isRaw = !!match[3]
        const user = match[4] // eg, badges
        const repo = match[5] // eg, shields
        const ghLabel = match[6] // eg, website
        const format = match[7]
        const query = {}
        const hasLabel = ghLabel !== undefined

        query.q = `repo:${user}/${repo}${isPR ? ' is:pr' : ' is:issue'}${
          isClosed ? ' is:closed' : ' is:open'
        }${hasLabel ? ` label:"${ghLabel}"` : ''}`

        const classText = isClosed ? 'closed' : 'open'
        const leftClassText = isRaw ? `${classText} ` : ''
        const rightClassText = !isRaw ? ` ${classText}` : ''
        const isGhLabelMultiWord = hasLabel && ghLabel.includes(' ')
        const labelText = hasLabel
          ? `${isGhLabelMultiWord ? `"${ghLabel}"` : ghLabel} `
          : ''
        const targetText = isPR ? 'pull requests' : 'issues'
        const badgeData = getBadgeData(
          leftClassText + labelText + targetText,
          data
        )
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        githubApiProvider.request(
          request,
          '/search/issues',
          query,
          (err, res, buffer) => {
            if (githubCheckErrorResponse(badgeData, err, res)) {
              sendBadge(format, badgeData)
              return
            }
            try {
              const data = JSON.parse(buffer)
              const issues = data.total_count
              badgeData.text[1] = metric(issues) + rightClassText
              badgeData.colorscheme = issues > 0 ? 'yellow' : 'brightgreen'
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
