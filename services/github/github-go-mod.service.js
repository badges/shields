'use strict'

const { renderVersionBadge } = require('../version')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { fetchRepoContent } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')
const { InvalidResponse } = require('..')

const goVersionRegExp = new RegExp('^go (.+)$', 'm')

module.exports = class GithubGoModGoVersion extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github/go-mod/go-version',
      pattern: ':user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub go.mod Go version',
        pattern: ':user/:repo',
        namedParams: { user: 'gohugoio', repo: 'hugo' },
        staticPreview: this.render({ version: '1.12' }),
        documentation,
      },
      {
        title: 'GitHub go.mod Go version (branch)',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'gohugoio',
          repo: 'hugo',
          branch: 'master',
        },
        staticPreview: this.render({ version: '1.12', branch: 'master' }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'Go' }
  }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'Go',
    })
  }

  async handle({ user, repo, branch }) {
    const content = await fetchRepoContent(this, {
      user,
      repo,
      branch,
      filename: 'go.mod',
    })
    const { go } = this.constructor.parseContent(content)
    return this.constructor.render({ version: go, branch })
  }

  static parseContent(content) {
    const match = goVersionRegExp.exec(content)
    if (!match) {
      throw new InvalidResponse({
        prettyMessage: 'Go version missing in go.mod',
      })
    }

    return {
      go: match[1],
    }
  }
}
