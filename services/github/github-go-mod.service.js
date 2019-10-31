'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { fetchRepoContent } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')
const { InvalidResponse } = require('..')

const queryParamSchema = Joi.object({
  filename: Joi.string(),
}).required()

const goVersionRegExp = new RegExp('^go (.+)$', 'm')

const keywords = ['golang']

module.exports = class GithubGoModGoVersion extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github/go-mod/go-version',
      pattern: ':user/:repo/:branch*',
      queryParamSchema,
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
        keywords,
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
        keywords,
      },
      {
        title: 'GitHub go.mod Go version (subfolder of monorepo)',
        pattern: ':user/:repo',
        namedParams: { user: 'golang', repo: 'go' },
        queryParams: { filename: 'src/go.mod' },
        staticPreview: this.render({ version: '1.14' }),
        documentation,
        keywords,
      },
      {
        title: 'GitHub go.mod Go version (branch & subfolder of monorepo)',
        pattern: ':user/:repo/:branch',
        namedParams: { user: 'golang', repo: 'go', branch: 'master' },
        queryParams: { filename: 'src/go.mod' },
        staticPreview: this.render({ version: '1.14' }),
        documentation,
        keywords,
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

  static transform(content) {
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

  async handle({ user, repo, branch }, { filename = 'go.mod' }) {
    const content = await fetchRepoContent(this, {
      user,
      repo,
      branch,
      filename,
    })
    const { go } = this.constructor.transform(content)
    return this.constructor.render({ version: go, branch })
  }
}
