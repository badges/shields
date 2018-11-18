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

  static get route() {
    return {
      base: 'github/status',
      pattern: ':which(s|contexts)/pulls/:user/:repo/:number(\\d+)',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub pull request check state',
        pattern: 's/pulls/:user/:repo/:number',
        staticExample: this.render({ which: 's', state: 'pending' }),
        exampleUrl: 's/pulls/badges/shields/1110',
        keywords: ['GitHub', 'pullrequest', 'detail', 'check'],
        documentation,
      },
      {
        title: 'GitHub pull request check contexts',
        pattern: 'contexts/pulls/:user/:repo/:number',
        staticExample: this.render({
          which: 'contexts',
          state: 'pending',
          stateCounts: { passed: 5, pending: 1 },
        }),
        exampleUrl: 'contexts/pulls/badges/shields/1110',
        keywords: ['GitHub', 'pullrequest', 'detail', 'check'],
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'checks',
      logo: 'github',
    }
  }

  static render({ which, state, stateCounts }) {
    let message
    if (which === 'contexts') {
      message = Object.entries(stateCounts)
        .map(([state, count]) => `${count} ${state}`)
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

  static transform({ state, statuses }) {
    return {
      state,
      stateCounts: countBy(statuses, 'state'),
    }
  }

  async handle({ which, user, repo, number }) {
    const {
      head: { sha: ref },
    } = await fetchIssue(this, { user, repo, number })

    // https://developer.github.com/v3/repos/statuses/#get-the-combined-status-for-a-specific-ref
    const json = await this._requestJson({
      schema,
      url: `/repos/${user}/${repo}/commits/${ref}/status`,
      errorMessages: errorMessagesFor('commit not found'),
    })
    const { state, stateCounts } = this.constructor.transform(json)

    return this.constructor.render({ which, state, stateCounts })
  }
}
