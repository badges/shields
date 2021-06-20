import prettyBytes from 'pretty-bytes'
import { BaseGithubLanguage } from './github-languages-base.js'
import { documentation } from './github-helpers.js'

export default class GithubCodeSize extends BaseGithubLanguage {
  static category = 'size'
  static route = {
    base: 'github/languages/code-size',
    pattern: ':user/:repo',
  }

  static examples = [
    {
      title: 'GitHub code size in bytes',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      staticPreview: this.render({ size: 1625000 }),
      documentation,
    },
  ]

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
