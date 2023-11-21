import prettyBytes from 'pretty-bytes'
import { pathParams } from '../index.js'
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

  static render({ size }) {
    return {
      message: prettyBytes(size),
      color: 'blue',
    }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({ size: this.getTotalSize(data) })
  }
}
