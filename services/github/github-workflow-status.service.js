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
}).required()

const keywords = ['action', 'actions']

export default class GithubWorkflowStatus extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'github/workflow/status',
    pattern: ':user/:repo/:workflow/:branch*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub Workflow Status',
      pattern: ':user/:repo/:workflow',
      namedParams: {
        user: 'actions',
        repo: 'toolkit',
        workflow: 'toolkit-unit-tests',
      },
      staticPreview: renderBuildStatusBadge({
        status: 'passing',
      }),
      documentation,
      keywords,
    },
    {
      title: 'GitHub Workflow Status (branch)',
      pattern: ':user/:repo/:workflow/:branch',
      namedParams: {
        user: 'actions',
        repo: 'toolkit',
        workflow: 'toolkit-unit-tests',
        branch: 'master',
      },
      staticPreview: renderBuildStatusBadge({
        status: 'passing',
      }),
      documentation,
      keywords,
    },
    {
      title: 'GitHub Workflow Status (event)',
      pattern: ':user/:repo/:workflow',
      namedParams: {
        user: 'actions',
        repo: 'toolkit',
        workflow: 'toolkit-unit-tests',
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
      url: `https://github.com/${user}/${repo}/workflows/${encodeURIComponent(
        workflow
      )}/badge.svg`,
      options: { searchParams: { branch, event } },
      valueMatcher: />([^<>]+)<\/tspan><\/text><\/g><path/,
      errorMessages: {
        404: 'repo, branch, or workflow not found',
      },
    })

    return { status }
  }

  async handle({ user, repo, workflow, branch }, { event }) {
    const { status } = await this.fetch({ user, repo, workflow, branch, event })
    return renderBuildStatusBadge({ status })
  }
}
