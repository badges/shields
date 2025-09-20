import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { metric } from '../text-formatters.js'

const schema = Joi.object({
  reviews: Joi.number().required(),
}).required()

class CodeRabbitPullRequest extends BaseJsonService {
  static category = 'analysis'
  static route = {
    base: 'coderabbit',
    pattern: 'prs/:provider(github|bitbucket|gitlab)/:org/:repo',
  }

  static openApi = {
    '/coderabbit/prs/{provider}/{org}/{repo}': {
      get: {
        summary: 'CodeRabbit Pull Request Reviews',
        description:
          'This badge pulls the number of PRs reviewed by [CodeRabbit](https://coderabbit.ai), AI code review tool',
        parameters: pathParams(
          {
            name: 'provider',
            example: 'github',
            description: 'Version Control Provider',
            schema: { type: 'string', enum: this.getEnum('provider') },
          },
          {
            name: 'org',
            example: 'coderabbitai',
            description: 'Organization or User name',
          },
          {
            name: 'repo',
            example: 'ast-grep-essentials',
            description: 'Repository name',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'coderabbit reviews',
  }

  static render({ reviews }) {
    return {
      message: metric(reviews),
      color: 'blue',
    }
  }

  async fetch({ provider, org, repo }) {
    return this._requestJson({
      schema,
      url: `https://api.coderabbit.ai/stats/${provider}/${org}/${repo}`,
      httpErrors: {
        400: 'provider or repo not found',
      },
    })
  }

  async handle({ provider, org, repo }) {
    const data = await this.fetch({ provider, org, repo })
    return this.constructor.render(data)
  }
}

export default CodeRabbitPullRequest
