import Joi from 'joi'
import countBy from 'lodash.countby'
import { GithubAuthV3Service } from './github-auth-service.js'
import { fetchIssue } from './github-common-fetch.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

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

const keywords = ['pullrequest', 'detail']

export default class GithubPullRequestCheckState extends GithubAuthV3Service {
  static category = 'build'
  static route = {
    base: 'github/status',
    pattern: ':variant(s|contexts)/pulls/:user/:repo/:number(\\d+)',
  }

  static examples = [
    {
      title: 'GitHub pull request check state',
      pattern: 's/pulls/:user/:repo/:number',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        number: '1110',
      },
      staticPreview: this.render({ variant: 's', state: 'pending' }),
      keywords,
      documentation,
    },
    {
      title: 'GitHub pull request check contexts',
      pattern: 'contexts/pulls/:user/:repo/:number',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        number: '1110',
      },
      staticPreview: this.render({
        variant: 'contexts',
        state: 'pending',
        stateCounts: { passed: 5, pending: 1 },
      }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'checks', namedLogo: 'github' }

  static render({ variant, state, stateCounts }) {
    let message
    if (variant === 'contexts') {
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

  async handle({ variant, user, repo, number }) {
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

    return this.constructor.render({ variant, state, stateCounts })
  }
}
