'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
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
module.exports = class GithubCommitStatus extends LegacyService {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'github/commit-status',
      pattern: ':user/:repo/:branch/:commit',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub commit merge status',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          branch: 'master',
          commit: '5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c',
        },
        staticPreview: {
          label: 'commit status',
          message: 'in master',
          color: 'brightgreen',
        },
        keywords: ['branch', 'merge'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/commit-status\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const [, user, repo, branch, commit, format] = match
        const apiUrl = `/repos/${user}/${repo}/compare/${branch}...${commit}`
        const badgeData = getBadgeData('commit status', data)
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (
            githubCheckErrorResponse(
              badgeData,
              err,
              res,
              'commit or branch not found'
            )
          ) {
            if (res && res.statusCode === 404) {
              try {
                if (
                  JSON.parse(buffer).message.startsWith(
                    'No common ancestor between'
                  )
                ) {
                  badgeData.text[1] = 'no common ancestor'
                  badgeData.colorscheme = 'lightgrey'
                }
              } catch (e) {
                badgeData.text[1] = 'invalid'
                badgeData.colorscheme = 'lightgrey'
              }
            }
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            const isInBranch =
              parsedData.status === 'identical' ||
              parsedData.status === 'behind'
            if (isInBranch) {
              badgeData.text[1] = `in ${branch}`
              badgeData.colorscheme = 'brightgreen'
            } else {
              // status: ahead or diverged
              badgeData.text[1] = `not in ${branch}`
              badgeData.colorscheme = 'yellow'
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
