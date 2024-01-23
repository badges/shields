import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { BaseGithubLanguage } from './github-languages-base.js'
import { documentation } from './github-helpers.js'

export default class GithubLanguageCount extends BaseGithubLanguage {
  static category = 'analysis'
  static route = { base: 'github/languages/count', pattern: ':user/:repo' }
  static openApi = {
    '/github/languages/count/{user}/{repo}': {
      get: {
        summary: 'GitHub language count',
        description: documentation,
        parameters: pathParams(
          {
            name: 'user',
            example: 'badges',
          },
          {
            name: 'repo',
            example: 'shields',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'languages' }

  static render({ count }) {
    return {
      message: metric(count),
      color: 'blue',
    }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({ count: Object.keys(data).length })
  }
}
