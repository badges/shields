'use strict'

const Joi = require('joi')
const { GithubAuthService } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

module.exports = class GithubCommitStatus extends GithubAuthService {
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
        staticPreview: this.render({
          isInBranch: true,
          branch: 'master',
        }),
        keywords: ['branch'],
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'commit status',
    }
  }

  static render({ isInBranch, branch }) {
    if (isInBranch) {
      return {
        message: `in ${branch}`,
        color: 'brightgreen',
      }
    } else {
      // status: ahead or diverged
      return {
        message: `not in ${branch}`,
        color: 'yellow',
      }
    }
  }

  async handle({ user, repo, branch, commit }) {
    const { message, status } = await this._requestJson({
      url: `/repos/${user}/${repo}/compare/${branch}...${commit}`,
      errorMessages: errorMessagesFor('commit or branch not found'),
      schema: Joi.object().required(),
    })

    const isInBranch = status === 'identical' || status === 'behind'

    return this.constructor.render({ isInBranch, branch })
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
