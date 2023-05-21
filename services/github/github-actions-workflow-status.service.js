import Joi from 'joi'
import { renderBuildStatusBadge } from '../build-status.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation } from './github-helpers.js'
import { fetchWorkflowRuns } from './github-common-fetch.js'

const queryParamSchema = Joi.object({
  event: Joi.string(),
  branch: Joi.alternatives().try(Joi.string(), Joi.number().cast('string')),
}).required()

const keywords = ['action', 'actions']

export default class GithubActionsWorkflowStatus extends GithubAuthV3Service {
  static category = 'build'

  static route = {
    base: 'github/actions/workflow/status',
    pattern: ':user/:repo/:workflow*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub Workflow Status',
      namedParams: {
        user: 'actions',
        repo: 'toolkit',
        workflow: 'unit-tests.yml',
      },
      staticPreview: renderBuildStatusBadge({
        status: 'passing',
      }),
      documentation,
      keywords,
    },
    {
      title: 'GitHub Workflow Status (with branch)',
      namedParams: {
        user: 'actions',
        repo: 'toolkit',
        workflow: 'unit-tests.yml',
      },
      queryParams: {
        branch: 'main',
      },
      staticPreview: renderBuildStatusBadge({
        status: 'passing',
      }),
      documentation,
      keywords,
    },
    {
      title: 'GitHub Workflow Status (with event)',
      namedParams: {
        user: 'actions',
        repo: 'toolkit',
        workflow: 'unit-tests.yml',
      },
      queryParams: {
        event: 'push',
      },
      staticPreview: renderBuildStatusBadge({
        status: 'passing',
      }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'build',
    namedLogo: 'github',
  }

  /* Value of the status property can be one of: “queued”, “in_progress”, or “completed”.
   * When it’s “completed,” it makes sense to check if it finished successfully.
   * We need a value of the conclusion property.
   * Can be one of the “success”, “failure”, “neutral”, “cancelled”, “skipped”, “timed_out”, or “action_required”.
   * Source: https://tabris.com/observing-workflow-run-status-on-github/
   */
  static toStatus({ status, conclusion }) {
    if (status === 'completed') {
      return conclusion
    } else {
      return status
    }
  }

  async handle({ user, repo, workflow }, { branch, event }) {
    const workflowRun = await fetchWorkflowRuns(this, {
      user,
      repo,
      workflow,
      branch,
      event,
    })
    const status = this.constructor.toStatus(workflowRun)
    return {
      ...this.constructor.defaultBadgeData,
      ...renderBuildStatusBadge({ status }),
    }
  }
}
