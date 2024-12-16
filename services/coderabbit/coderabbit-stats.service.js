import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  prCount: Joi.number().required(),
}).required()

// Note: Service name must match file name without '.service.js'
class CoderabbitStats extends BaseJsonService {
  static category = 'analysis'
  static route = {
    base: 'coderabbit',
    pattern: 'stats/:provider/:org/:repo',
  }

  static examples = [
    {
      title: 'CodeRabbit PR Stats',
      namedParams: {
        provider: 'github',
        org: 'coderabbit-ai',
        repo: 'demo-repository',
      },
      staticPreview: this.render({
        prCount: 100,
      }),
    },
  ]

  static defaultBadgeData = {
    label: 'coderabbit reviews',
  }

  static render({ prCount }) {
    return {
      message: `${prCount} PRs`,
      color: 'blue',
    }
  }

  async fetch({ provider, org, repo }) {
    return this._requestJson({
      schema,
      url: `https://api.coderabbit.ai/stats/${provider}/${org}/${repo}`,
      httpErrors: {
        404: 'repository not found',
      },
    })
  }

  async handle({ provider, org, repo }) {
    const data = await this.fetch({ provider, org, repo })
    return this.constructor.render(data)
  }
}

export default CoderabbitStats
