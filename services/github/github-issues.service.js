'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { makeLogo: getLogo } = require('../../lib/logos')
const { metric } = require('../text-formatters')
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
module.exports = class GithubIssues extends LegacyService {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'github',
      pattern:
        ':which(issues|issues-closed|issues-pr|issues-pr-closed)-:raw(raw)?/:user/:repo/:label?',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub issues',
        pattern: 'issues/:user/:repo',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: {
          label: 'issues',
          message: '167 open',
          color: 'yellow',
        },
        documentation,
      },
      {
        title: 'GitHub issues',
        pattern: 'issues-raw/:user/:repo',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: {
          label: 'open issues',
          message: '167',
          color: 'yellow',
        },
        documentation,
      },
      {
        title: 'GitHub issues by-label',
        pattern: 'issues/:user/:repo/:label',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          label: 'service-badge',
        },
        staticPreview: {
          label: 'service-badge issues',
          message: '110 open',
          color: 'yellow',
        },
        documentation,
      },
      {
        title: 'GitHub issues by-label',
        pattern: 'issues-raw/:user/:repo/:label',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          label: 'service-badge',
        },
        staticPreview: {
          label: 'open service-badge issues',
          message: '110',
          color: 'yellow',
        },
        documentation,
      },
      {
        title: 'GitHub closed issues',
        pattern: 'issues-closed/:user/:repo',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: {
          label: 'issues',
          message: '899 closed',
          color: 'yellow',
        },
        documentation,
      },
      {
        title: 'GitHub closed issues',
        pattern: 'issues-closed-raw/:user/:repo',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: {
          label: 'closed issues',
          message: '899',
          color: 'yellow',
        },
        documentation,
      },
      {
        title: 'GitHub pull requests',
        pattern: 'issues-pr/:user/:repo',
        namedParams: {
          user: 'cdnjs',
          repo: 'cdnjs',
        },
        staticPreview: {
          label: 'pull requests',
          message: '136 open',
          color: 'yellow',
        },
        keywords: ['pullrequest', 'pr'],
        documentation,
      },
      {
        title: 'GitHub pull requests',
        pattern: 'issues-pr-raw/:user/:repo',
        namedParams: {
          user: 'cdnjs',
          repo: 'cdnjs',
        },
        staticPreview: {
          label: 'open pull requests',
          message: '136',
          color: 'yellow',
        },
        keywords: ['pullrequest', 'pr'],
        documentation,
      },
      {
        title: 'GitHub closed pull requests',
        pattern: 'issues-pr-closed/:user/:repo',
        namedParams: {
          user: 'cdnjs',
          repo: 'cdnjs',
        },
        staticPreview: {
          label: 'pull requests',
          message: '7k closed',
          color: 'yellow',
        },
        keywords: ['pullrequest', 'pr'],
        documentation,
      },
      {
        title: 'GitHub closed pull requests',
        pattern: 'issues-pr-closed-raw/:user/:repo',
        namedParams: {
          user: 'cdnjs',
          repo: 'cdnjs',
        },
        staticPreview: {
          label: 'closed pull requests',
          message: '7k',
          color: 'yellow',
        },
        keywords: ['pullrequest', 'pr'],
        documentation,
      },
      {
        title: 'GitHub pull requests by-label',
        pattern: 'issues-pr/:user/:repo/:label',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          label: 'service-badge',
        },
        staticPreview: {
          label: 'service-badge pull requests',
          message: '8 open',
          color: 'yellow',
        },
        keywords: ['pullrequests', 'pr'],
        documentation,
      },
      {
        title: 'GitHub pull requests by-label',
        pattern: 'issues-pr-raw/:user/:repo/:label',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          label: 'service-badge',
        },
        staticPreview: {
          label: 'open service-badge pull requests',
          message: '8',
          color: 'yellow',
        },
        keywords: ['pullrequests', 'pr'],
        documentation,
      },
    ]
  }

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
