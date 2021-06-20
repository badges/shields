import { BaseGithubLanguage } from './github-languages-base.js'
import { documentation } from './github-helpers.js'

export default class GithubLanguageCount extends BaseGithubLanguage {
  static category = 'analysis'
  static route = { base: 'github/languages/count', pattern: ':user/:repo' }
  static examples = [
    {
      title: 'GitHub language count',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      staticPreview: this.render({ count: 5 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'languages' }

  static render({ count }) {
    return {
      message: count,
      color: 'blue',
    }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({ count: Object.keys(data).length })
  }
}
