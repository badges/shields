'use strict'

const LegacyService = require('../legacy-service')
const {
  makeLabel: getLabel,
  makeBadgeData: getBadgeData,
} = require('../../lib/badge-data')
const { makeLogo: getLogo } = require('../../lib/logos')
const { formatDate } = require('../../lib/text-formatters')
const { age: ageColor } = require('../../lib/color-formatters')
const {
  documentation,
  stateColor: githubStateColor,
  commentsColor: githubCommentsColor,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

const commonExampleAttrs = {
  keywords: ['pullrequest', 'detail'],
  documentation,
}

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class GithubIssueDetail extends LegacyService {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'github/issues/detail',
      pattern:
        ':which(s|title|u|label|comments|age|last-update)/:user/:repo/:number(0-9+)',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub issue/pull request state',
        pattern: 's/:user/:repo/:number',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          number: '979',
        },
        staticPreview: {
          label: 'issue 979',
          message: 'closed',
          color: 'red',
        },
        ...commonExampleAttrs,
      },
      {
        title: 'GitHub issue/pull request title',
        pattern: 'title/:user/:repo/:number',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          number: '1290',
        },
        staticPreview: {
          label: 'issue 1290',
          message: 'Node 9 support',
          color: 'lightgrey',
        },
        ...commonExampleAttrs,
      },
      {
        title: 'GitHub issue/pull request author',
        pattern: 'u/:user/:repo/:number',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          number: '979',
        },
        staticPreview: {
          label: 'author',
          message: 'paulmelnikow',
          color: 'lightgrey',
        },
        ...commonExampleAttrs,
      },
      {
        title: 'GitHub issue/pull request label',
        pattern: 'label/:user/:repo/:number',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          number: '979',
        },
        staticPreview: {
          label: 'label',
          message: 'bug | developer-experience',
          color: 'lightgrey',
        },
        ...commonExampleAttrs,
      },
      {
        title: 'GitHub issue/pull request comments',
        pattern: 'comments/:user/:repo/:number',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          number: '979',
        },
        staticPreview: {
          label: 'comments',
          message: '24',
          color: 'yellow',
        },
        ...commonExampleAttrs,
      },
      {
        title: 'GitHub issue/pull request age',
        pattern: 'age/:user/:repo/:number',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          number: '979',
        },
        staticPreview: {
          label: 'created',
          message: 'april 2017',
          color: 'orange',
        },
        ...commonExampleAttrs,
      },
      {
        title: 'GitHub issue/pull request last update',
        pattern: 'last-update/:user/:repo/:number',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          number: '979',
        },
        staticPreview: {
          label: 'updated',
          message: 'december 2017',
          color: 'orange',
        },
        ...commonExampleAttrs,
      },
    ]
  }

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
                badgeData.colorscheme = undefined
                badgeData.colorB = queryParams.colorB || githubStateColor(state)
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
                  badgeData.colorscheme = undefined
                  badgeData.colorB =
                    queryParams.colorB || parsedData.labels[0].color
                }
                break
              case 'comments': {
                badgeData.text[0] = getLabel('comments', queryParams)
                const comments = (badgeData.text[1] = parsedData.comments)
                badgeData.colorscheme = undefined
                badgeData.colorB =
                  queryParams.coloB || githubCommentsColor(comments)
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
