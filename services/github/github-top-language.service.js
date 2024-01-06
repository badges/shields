import { pathParams } from '../index.js'
import { BaseGithubLanguage } from './github-languages-base.js'
import { documentation } from './github-helpers.js'

export default class GithubTopLanguage extends BaseGithubLanguage {
  static category = 'analysis'

  static route = {
    base: 'github/languages/top',
    pattern: ':user/:repo',
  }

  static openApi = {
    '/github/languages/top/{user}/{repo}': {
      get: {
        summary: 'GitHub top language',
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

  static defaultBadgeData = {
    label: 'language',
  }

  static render({ language, languageSize, totalSize }) {
    const message =
      totalSize === 0
        ? 'none'
        : `${((languageSize / totalSize) * 100).toFixed(1)}%`
    return { label: language.toLowerCase(), message, color: 'blue' }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    const language = Object.keys(data).reduce(
      (a, b) => (data[a] > data[b] ? a : b),
      'language',
    )
    return this.constructor.render({
      language,
      languageSize: data[language],
      totalSize: this.getTotalSize(data),
    })
  }
}
