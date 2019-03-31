'use strict'

const { BaseGithubLanguage } = require('./github-languages-base')
const { documentation } = require('./github-helpers')

module.exports = class GithubLanguageCount extends BaseGithubLanguage {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'github/languages/count',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
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
  }

  static get defaultBadgeData() {
    return {
      label: 'languages',
    }
  }

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
