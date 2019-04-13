'use strict'

const prettyBytes = require('pretty-bytes')
const { BaseGithubLanguage } = require('./github-languages-base')
const { documentation } = require('./github-helpers')

module.exports = class GithubCodeSize extends BaseGithubLanguage {
  static get category() {
    return 'size'
  }

  static get route() {
    return {
      base: 'github/languages/code-size',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
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
  }

  static get defaultBadgeData() {
    return {
      label: 'code size',
    }
  }

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
