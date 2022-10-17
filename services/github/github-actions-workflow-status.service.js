import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { NotFound } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

const schema = Joi.object({
  workflow_runs: Joi.array()
    .items(
      Joi.object({
        conclusion: Joi.alternatives()
          .try(isBuildStatus, Joi.equal('no status'))
          .required(),
      })
    )
    .required()
    .min(0)
    .max(1),
}).required()

const queryParamSchema = Joi.object({
  event: Joi.string(),
  branch: Joi.string().required(),
}).required()

const keywords = ['action', 'actions']

export default class GithubActionsWorkflowStatus extends GithubAuthV3Service {
  static category = 'build'

  static route = {
    base: 'github/actions/workflow/status',
    pattern: ':user/:repo/:workflow+',
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
        branch: 'main',
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
  }

  async fetch({ user, repo, workflow, branch, event }) {
    return await this._requestJson({
      schema,
      url: `/repos/${user}/${repo}/actions/workflows/${workflow}/runs`,
      options: {
        searchParams: {
          branch,
          event,
          page: '1',
          per_page: '1',
          exclude_pull_requests: 'true',
        },
      },
      errorMessages: errorMessagesFor('repo or workflow not found'),
    })
  }

  async handle({ user, repo, workflow }, { branch, event }) {
    const data = await this.fetch({ user, repo, workflow, branch, event })
    if (data.workflow_runs.length === 0) {
      throw new NotFound({ prettyMessage: 'branch or event not found' })
    }
    return renderBuildStatusBadge({ status: data.workflow_runs[0].conclusion })
  }
}
