import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService } from '../index.js'
import { documentation } from './github-helpers.js'

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('no status'))
    .required(),
}).required()

const queryParamSchema = Joi.object({
  event: Joi.string(),
  branch: Joi.alternatives().try(Joi.string(), Joi.number().cast('string')),
}).required()

const keywords = ['action', 'actions']

export default class GithubActionsWorkflowStatus extends BaseSvgScrapingService {
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
  }

  async fetch({ user, repo, workflow, branch, event }) {
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://github.com/${user}/${repo}/actions/workflows/${encodeURIComponent(
        workflow
      )}/badge.svg`,
      options: { searchParams: { branch, event } },
      valueMatcher: />([^<>]+)<\/tspan><\/text><\/g><path/,
      errorMessages: {
        404: 'repo or workflow not found',
      },
    })

    return { status }
  }

  async handle({ user, repo, workflow }, { branch, event }) {
    const { status } = await this.fetch({ user, repo, workflow, branch, event })
    return renderBuildStatusBadge({ status })
  }
}
