import Joi from 'joi'
import countBy from 'lodash.countby'
import { pathParams } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { fetchIssue } from './github-common-fetch.js'
import {
  documentation as commonDocumentation,
  httpErrorsFor,
} from './github-helpers.js'

const description = `
Displays the status of a pull request, as reported by the Commit Status API.
Nowadays, GitHub Actions and many third party integrations report state via the
Checks API. If this badge does not show expected values, please try out our
corresponding Check Runs badge instead. You can read more about status checks in
the [GitHub documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks).

${commonDocumentation}
`

const schema = Joi.object({
  state: Joi.equal('failure', 'pending', 'success').required(),
  statuses: Joi.array()
    .items(
      Joi.object({
        state: Joi.equal('error', 'failure', 'pending', 'success').required(),
      }),
    )
    .default([]),
}).required()

export default class GithubPullRequestCheckState extends GithubAuthV3Service {
  static category = 'build'
  static route = {
    base: 'github/status',
    pattern: ':variant(s|contexts)/pulls/:user/:repo/:number(\\d+)',
  }

  static openApi = {
    '/github/status/s/pulls/{user}/{repo}/{number}': {
      get: {
        summary: 'GitHub pull request status',
        description,
        parameters: pathParams(
          {
            name: 'user',
            example: 'badges',
          },
          {
            name: 'repo',
            example: 'shields',
          },
          {
            name: 'number',
            example: '1110',
          },
        ),
      },
    },
    '/github/status/contexts/pulls/{user}/{repo}/{number}': {
      get: {
        summary: 'GitHub pull request check contexts',
        description,
        parameters: pathParams(
          {
            name: 'user',
            example: 'badges',
          },
          {
            name: 'repo',
            example: 'shields',
          },
          {
            name: 'number',
            example: '1110',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'checks' }

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
      httpErrors: httpErrorsFor('commit not found'),
    })
    const { state, stateCounts } = this.constructor.transform(json)

    return this.constructor.render({ variant, state, stateCounts })
  }
}
