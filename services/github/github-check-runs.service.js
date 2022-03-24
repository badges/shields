import Joi from 'joi'
import countBy from 'lodash.countby'
import { nonNegativeInteger } from '../validators.js'
import { renderBuildStatusBadge } from '../build-status.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

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
          'stale',
          'success',
          'timed_out'
        ).required(),
      })
    )
    .default([]),
}).required()

export default class GithubCheckRuns extends GithubAuthV3Service {
  static category = 'build'
  static route = {
    base: 'github/checks-runs',
    pattern: ':user/:repo/:ref',
  }

  static examples = [
    {
      title: 'GitHub branch checks runs',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        ref: 'master',
      },
      staticPreview: renderBuildStatusBadge({
        status: 'success',
      }),
      keywords: ['status'],
      documentation,
    },
    {
      title: 'GitHub commit checks runs',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        ref: '91b108d4b7359b2f8794a4614c11cb1157dc9fff',
      },
      staticPreview: renderBuildStatusBadge({
        status: 'success',
      }),
      keywords: ['status'],
      documentation,
    },
    {
      title: 'GitHub tag checks runs',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        ref: '3.3.0',
      },
      staticPreview: renderBuildStatusBadge({
        status: 'success',
      }),
      keywords: ['status'],
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'checks' }

  static transform({ total_count, check_runs }) {
    return {
      total: total_count,
      statusCounts: countBy(check_runs, 'status'),
      conclusionCounts: countBy(check_runs, 'conclusion'),
    }
  }

  static mapState(stateCounts) {
    const orangeStates = ['action_required', 'stale']

    const redStates = ['cancelled', 'failure', 'timed_out']

    // ignore 'neutral' and 'skipped' states
    let state = 'success'
    for (const stateValue of Object.keys(stateCounts)) {
      if (redStates.includes(stateValue)) {
        state = 'failure'
        break
      } else if (orangeStates.includes(stateValue)) {
        state = 'partially succeeded'
      }
    }
    return state
  }

  async handle({ user, repo, ref }) {
    const json = await this._requestJson({
      url: `/repos/${user}/${repo}/commits/${ref}/check-runs`,
      errorMessages: errorMessagesFor('ref or repo not found'),
      schema,
    })

    const { total, statusCounts, conclusionCounts } =
      this.constructor.transform(json)

    let state
    if (total === 0) {
      state = 'no tests'
    } else if (statusCounts.queued) {
      state = 'queued'
    } else if (statusCounts.in_progress) {
      state = 'processing'
    } else {
      // all completed
      state = this.constructor.mapState(conclusionCounts)
    }

    return renderBuildStatusBadge({ status: state })
  }
}
