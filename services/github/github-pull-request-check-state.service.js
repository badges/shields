'use strict'

const Joi = require('joi')
const countBy = require('lodash.countby')
const GithubAuthService = require('./github-auth-service')
const { fetchIssue } = require('./github-common-fetch')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({
  state: Joi.equal('failure', 'pending', 'success').required(),
  statuses: Joi.array()
    .items(
      Joi.object({
        state: Joi.equal('error', 'failure', 'pending', 'success').required(),
      })
    )
    .default([]),
}).required()

module.exports = class GithubPullRequestCheckState extends GithubAuthService {
  static get category() {
    return 'other'
  }

  static get url() {
    return {
      base: 'github/status',
      format: '(s|contexts)/pulls/([^/]+)/([^/]+)/(\\d+)',
      capture: ['which', 'user', 'repo', 'number'],
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub pull request check state',
        previewUrl: 's/pulls/badges/shields/1110',
        keywords: ['GitHub', 'pullrequest', 'detail', 'check'],
        documentation,
      },
      {
        title: 'GitHub pull request check contexts',
        previewUrl: 'contexts/pulls/badges/shields/1110',
        keywords: ['GitHub', 'pullrequest', 'detail', 'check'],
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'checks',
    }
  }

  static render({ which, state, statuses }) {
    let message
    if (which === 'contexts') {
      const counts = countBy(statuses, 'state')
      message = Object.keys(counts)
        .map(k => `${counts[k]} ${k}`)
        .join(', ')
    } else {
      message = state
    }

    const color = {
      pending: 'dbab09',
      success: '2cbe4e',
      failure: 'cb2431',
    }[state]

    return { message, color }
  }

  async handle({ which, user, repo, number }) {
    const {
      head: { sha: ref },
    } = await fetchIssue(this, { user, repo, number })

    // https://developer.github.com/v3/repos/statuses/#get-the-combined-status-for-a-specific-ref
    const { state, statuses } = await this._requestJson({
      schema,
      url: `/repos/${user}/${repo}/commits/${ref}/status`,
      errorMessages: errorMessagesFor('commit not found'),
    })

    return this.constructor.render({ which, state, statuses })
  }
}
