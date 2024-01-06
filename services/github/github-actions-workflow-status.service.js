import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService, pathParam, queryParam } from '../index.js'
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

export default class GithubActionsWorkflowStatus extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'github/actions/workflow/status',
    pattern: ':user/:repo/:workflow+',
    queryParamSchema,
  }

  static openApi = {
    '/github/actions/workflow/status/{user}/{repo}/{workflow}': {
      get: {
        summary: 'GitHub Actions Workflow Status',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'actions' }),
          pathParam({ name: 'repo', example: 'toolkit' }),
          pathParam({ name: 'workflow', example: 'unit-tests.yml' }),
          queryParam({ name: 'branch', example: 'main' }),
          queryParam({
            name: 'event',
            example: 'push',
            description:
              'See GitHub Actions [Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows) for allowed values.',
          }),
        ],
      },
    },
  }

  static _cacheLength = 60

  static defaultBadgeData = {
    label: 'build',
  }

  async fetch({ user, repo, workflow, branch, event }) {
    const workflowPath = workflow
      .split('/')
      .map(el => encodeURIComponent(el))
      .join('/')
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://github.com/${user}/${repo}/actions/workflows/${workflowPath}/badge.svg`,
      options: { searchParams: { branch, event } },
      valueMatcher: />([^<>]+)<\/tspan><\/text><\/g><path/,
      httpErrors: {
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
