import { pathParams } from '../index.js'
import { renderSizeBadge } from '../size.js'
import { BaseGithubLanguage } from './github-languages-base.js'
import { documentation } from './github-helpers.js'

export default class GithubCodeSize extends BaseGithubLanguage {
  static category = 'size'
  static route = {
    base: 'github/languages/code-size',
    pattern: ':user/:repo',
  }

  static openApi = {
    '/github/languages/code-size/{user}/{repo}': {
      get: {
        summary: 'GitHub code size in bytes',
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

  static defaultBadgeData = { label: 'code size' }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return renderSizeBadge(this.getTotalSize(data), 'iec', 'code size')
  }
}
