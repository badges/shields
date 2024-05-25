import Joi from 'joi'
import countBy from 'lodash.countby'
import { pathParam, queryParam } from '../index.js'
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
        name: Joi.string().required(),
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

const queryParamSchema = Joi.object({
  nameFilter: Joi.string(),
})

export default class GithubCheckRuns extends GithubAuthV3Service {
  static category = 'build'
  static route = {
    base: 'github/check-runs',
    pattern: ':user/:repo/:ref+',
    queryParamSchema,
  }

  static openApi = {
    '/github/check-runs/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub branch check runs',
        description,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({ name: 'branch', example: 'master' }),
          queryParam({
            name: 'nameFilter',
            description: 'Name of a check run',
            example: 'test-lint',
          }),
        ],
      },
    },
    '/github/check-runs/{user}/{repo}/{commit}': {
      get: {
        summary: 'GitHub commit check runs',
        description,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({
            name: 'commit',
            example: '91b108d4b7359b2f8794a4614c11cb1157dc9fff',
          }),
          queryParam({
            name: 'nameFilter',
            description: 'Name of a check run',
            example: 'test-lint',
          }),
        ],
      },
    },
    '/github/check-runs/{user}/{repo}/{tag}': {
      get: {
        summary: 'GitHub tag check runs',
        description,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({ name: 'tag', example: '3.3.0' }),
          queryParam({
            name: 'nameFilter',
            description: 'Name of a check run',
            example: 'test-lint',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'checks' }

  static transform(
    { total_count: totalCount, check_runs: checkRuns },
    nameFilter,
  ) {
    const filteredCheckRuns =
      nameFilter && nameFilter.length > 0
        ? checkRuns.filter(checkRun => checkRun.name === nameFilter)
        : checkRuns

    return {
      total: totalCount,
      statusCounts: countBy(filteredCheckRuns, 'status'),
      conclusionCounts: countBy(filteredCheckRuns, 'conclusion'),
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

  async handle({ user, repo, ref }, { nameFilter }) {
    // https://docs.github.com/en/rest/checks/runs#list-check-runs-for-a-git-reference
    const json = await this._requestJson({
      url: `/repos/${user}/${repo}/commits/${ref}/check-runs`,
      httpErrors: httpErrorsFor('ref or repo not found'),
      schema,
    })

    const state = this.constructor.mapState(
      this.constructor.transform(json, nameFilter),
    )

    return renderBuildStatusBadge({ status: state })
  }
}
