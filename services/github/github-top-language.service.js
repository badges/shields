'use strict'

const { BaseGithubLanguage } = require('./github-languages-base')
const { documentation } = require('./github-helpers')

module.exports = class GithubTopLanguage extends BaseGithubLanguage {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'github/languages/top',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub top language',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: this.render({
          language: 'javascript',
          languageSize: 99.5,
          totalSize: 100,
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'language',
    }
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
      'language'
    )
    return this.constructor.render({
      language,
      languageSize: data[language],
      totalSize: this.getTotalSize(data),
    })
  }
}
