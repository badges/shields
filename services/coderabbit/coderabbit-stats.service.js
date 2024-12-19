import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  reviews: Joi.number().required(),
}).required()

class CodeRabbitStats extends BaseJsonService {
  static category = 'analysis'
  static route = {
    base: 'coderabbit',
    pattern: 'stats/:provider/:org/:repo',
  }

  static examples = [
    {
      title: 'CodeRabbit Review Stats',
      namedParams: {
        provider: 'github',
        org: 'coderabbitai',
        repo: 'ast-grep-essentials',
      },
      staticPreview: this.render({
        reviews: 101,
      }),
      documentation: 'Shows the number of CodeRabbit reviews for a repository',
    },
  ]

  static defaultBadgeData = {
    label: 'CodeRabbit',
    labelColor: '171717',
  }

  static render({ reviews }) {
    return {
      message: `${reviews} Reviews`,
      color: 'ff570a',
    }
  }

  static renderError({ message }) {
    return {
      message,
      color: '9f9f9f',
    }
  }

  async fetch({ provider, org, repo }) {
    return this._requestJson({
      schema,
      url: `https://api.coderabbit.ai/stats/${provider}/${org}/${repo}`,
      httpErrors: {
        404: 'invalid',
      },
    })
  }

  async handle({ provider, org, repo }) {
    try {
      const data = await this.fetch({ provider, org, repo })
      return this.constructor.render(data)
    } catch (error) {
      return this.constructor.renderError({ message: error.message })
    }
  }
}

export default CodeRabbitStats
