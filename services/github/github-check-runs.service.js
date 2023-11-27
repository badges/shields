import Joi from 'joi'
import countBy from 'lodash.countby'
import { pathParams } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import { renderBuildStatusBadge } from '../build-status.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import {
  documentation as commonDocumentation,
  httpErrorsFor,
} from './github-helpers.js'

const description = `
The Check Runs service shows the status of GitHub action runs.

${commonDocumentation}
`

const schema = Joi.object({
  total_count: nonNegativeInteger,
  check_runs: Joi.array()
    .items(
      Joi.object({
        status: Joi.equal('completed', 'in_progress', 'queued').required(),
        conclusion: Joi.equal(
          'action_required',
          'cancelled',
          'failure',
          'neutral',
          'skipped',
          'success',
          'timed_out',
          null,
        ).required(),
      }),
    )
    .default([]),
}).required()

export default class GithubCheckRuns extends GithubAuthV3Service {
  static category = 'build'
  static route = {
    base: 'github/checks-runs',
    pattern: ':user/:repo/:ref+',
  }

  static openApi = {
    '/github/checks-runs/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub branch checks runs',
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
            name: 'branch',
            example: 'master',
          },
        ),
      },
      '/github/checks-runs/{user}/{repo}/{tag}': {
        get: {
          summary: 'GitHub tag checks runs',
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
              name: 'tag',
              example: '3.3.0',
            },
          ),
        },
      },
      '/github/checks-runs/{user}/{repo}/{commit}': {
        get: {
          summary: 'GitHub commit checks runs',
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
              name: 'commit',
              example: '91b108d4b7359b2f8794a4614c11cb1157dc9fff',
            },
          ),
        },
      },
    },
  }

  static defaultBadgeData = { label: 'checks', namedLogo: 'github' }

  static transform({ total_count: totalCount, check_runs: checkRuns }) {
    return {
      total: totalCount,
      statusCounts: countBy(checkRuns, 'status'),
      conclusionCounts: countBy(checkRuns, 'conclusion'),
    }
  }

  static mapState({ total, statusCounts, conclusionCounts }) {
    let state
    if (total === 0) {
      state = 'no check runs'
    } else if (statusCounts.queued) {
      state = 'queued'
    } else if (statusCounts.in_progress) {
      state = 'pending'
    } else if (statusCounts.completed) {
      // all check runs are completed, now evaluate conclusions
      const orangeStates = ['action_required', 'stale']
      const redStates = ['cancelled', 'failure', 'timed_out']

      // assume "passing (green)"
      state = 'passing'
      for (const stateValue of Object.keys(conclusionCounts)) {
        if (orangeStates.includes(stateValue)) {
          // orange state renders "passing (orange)"
          state = 'partially succeeded'
        } else if (redStates.includes(stateValue)) {
          // red state renders "failing (red)"
          state = 'failing'
          break
        }
      }
    } else {
      state = 'unknown status'
    }
    return state
  }

  async handle({ user, repo, ref }) {
    // https://docs.github.com/en/rest/checks/runs#list-check-runs-for-a-git-reference
    const json = await this._requestJson({
      url: `/repos/${user}/${repo}/commits/${ref}/check-runs`,
      httpErrors: httpErrorsFor('ref or repo not found'),
      schema,
    })

    const state = this.constructor.mapState(this.constructor.transform(json))

    return renderBuildStatusBadge({ status: state })
  }
}
