'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { InvalidResponse } = require('..')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { fetchRepoContent } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')

const queryParamSchema = Joi.object({
  filename: Joi.string(),
}).required()

const versionRegExp = /^Version:[\s]*(.+)$/m

module.exports = class GithubRPackageVersion extends (
  ConditionalGithubAuthV3Service
) {
  static category = 'version'

  static route = {
    base: 'github/r-package/v',
    pattern: ':user/:repo/:branch*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub R package version',
      pattern: ':user/:repo',
      namedParams: { user: 'mixOmicsTeam', repo: 'mixOmics' },
      staticPreview: this.render({ version: '6.10.9' }),
      documentation,
    },
    {
      title: 'GitHub R package version (branch)',
      pattern: ':user/:repo/:branch',
      namedParams: { user: 'mixOmicsTeam', repo: 'mixOmics', branch: 'master' },
      staticPreview: this.render({ version: '6.10.9', branch: 'master' }),
      documentation,
    },
    {
      title: 'GitHub R package version (subdirectory of monorepo)',
      pattern: ':user/:repo',
      namedParams: { user: 'mixOmicsTeam', repo: 'mixOmics' },
      queryParams: { filename: 'subdirectory/DESCRIPTION' },
      staticPreview: this.render({ version: '6.10.9' }),
      documentation,
    },
    {
      title: 'GitHub R package version (branch & subdirectory of monorepo)',
      pattern: ':user/:repo/:branch',
      namedParams: { user: 'mixOmicsTeam', repo: 'mixOmics', branch: 'master' },
      queryParams: { filename: 'subdirectory/DESCRIPTION' },
      staticPreview: this.render({ version: '6.10.9', branch: 'master' }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'R' }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'R',
    })
  }

  static transform(content, filename) {
    const match = versionRegExp.exec(content)
    if (!match) {
      throw new InvalidResponse({
        prettyMessage: `Version missing in ${filename}`,
      })
    }

    return {
      version: match[1],
    }
  }

  async handle({ user, repo, branch }, { filename = 'DESCRIPTION' }) {
    const content = await fetchRepoContent(this, {
      user,
      repo,
      branch,
      filename,
    })
    const { version } = this.constructor.transform(content, filename)
    return this.constructor.render({ version, branch })
  }
}
