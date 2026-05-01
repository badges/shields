import Joi from 'joi'
import countBy from 'lodash.countby'
import { pathParam } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import { renderBuildStatusBadge } from '../build-status.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import {
  documentation as commonDocumentation,
  httpErrorsFor,
} from './github-helpers.js'

const description = `
The Check Suites service shows the aggregate status of GitHub check suites.
This is useful for GitHub Actions workflows where individual check runs can fail
with continue-on-error while the parent check suite succeeds.

For individual check run status, use the corresponding
[Check Runs badge][check-runs-link] instead.

${commonDocumentation}
`

const checkStatuses = [
  'completed',
  'in_progress',
  'pending',
  'queued',
  'requested',
  'waiting',
]

const checkSuiteConclusions = [
  'action_required',
  'cancelled',
  'failure',
  'neutral',
  'skipped',
  'stale',
  'startup_failure',
  'success',
  'timed_out',
]

const schema = Joi.object({
  check_suites: Joi.array()
    .items(
      Joi.object({
        status: Joi.equal(...checkStatuses).required(),
        conclusion: Joi.equal(...checkSuiteConclusions, null).required(),
        latest_check_runs_count: nonNegativeInteger.required(),
      }),
    )
    .default([]),
}).required()

export default class GithubCheckSuites extends GithubAuthV3Service {
  static category = 'build'
  static route = {
    base: 'github/check-suites',
    pattern: ':user/:repo/:ref+',
  }

  static openApi = {
    '/github/check-suites/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub branch check suites',
        description: `${description}
        [check-runs-link]: https://shields.io/badges/git-hub-branch-check-runs`,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({ name: 'branch', example: 'master' }),
        ],
      },
    },
    '/github/check-suites/{user}/{repo}/{commit}': {
      get: {
        summary: 'GitHub commit check suites',
        description: `${description}
        [check-runs-link]: https://shields.io/badges/git-hub-commit-check-runs`,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({
            name: 'commit',
            example: '91b108d4b7359b2f8794a4614c11cb1157dc9fff',
          }),
        ],
      },
    },
    '/github/check-suites/{user}/{repo}/{tag}': {
      get: {
        summary: 'GitHub tag check suites',
        description: `${description}
        [check-runs-link]: https://shields.io/badges/git-hub-tag-check-runs`,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({ name: 'tag', example: '3.3.0' }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'checks' }

  static transform({ check_suites: checkSuites }) {
    const suitesWithCheckRuns = checkSuites.filter(
      checkSuite => checkSuite.latest_check_runs_count > 0,
    )

    return {
      total: suitesWithCheckRuns.length,
      statusCounts: countBy(suitesWithCheckRuns, 'status'),
      conclusionCounts: countBy(suitesWithCheckRuns, 'conclusion'),
    }
  }

  static mapState({ total, statusCounts, conclusionCounts }) {
    let state
    if (total === 0) {
      state = 'no check suites'
    } else if (
      statusCounts.queued ||
      statusCounts.requested ||
      statusCounts.waiting
    ) {
      state = 'queued'
    } else if (statusCounts.in_progress || statusCounts.pending) {
      state = 'pending'
    } else if (statusCounts.completed) {
      const orangeStates = ['action_required', 'stale']
      const redStates = ['cancelled', 'failure', 'startup_failure', 'timed_out']

      state = 'passing'
      for (const stateValue of Object.keys(conclusionCounts)) {
        if (orangeStates.includes(stateValue)) {
          state = 'partially succeeded'
        } else if (redStates.includes(stateValue)) {
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
    // https://docs.github.com/en/rest/checks/suites#list-check-suites-for-a-git-reference
    const json = await this._requestJson({
      url: `/repos/${user}/${repo}/commits/${ref}/check-suites`,
      httpErrors: httpErrorsFor('ref or repo not found'),
      schema,
    })

    const state = this.constructor.mapState(this.constructor.transform(json))

    return renderBuildStatusBadge({ status: state })
  }
}
