'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../../lib/version')
const {
  transformAndValidate,
  renderDynamicBadge,
} = require('../dynamic-common')
const { semver } = require('../validators')
const { ConditionalGithubAuthService } = require('./github-auth-service')
const { fetchJsonFromRepo } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')

const versionSchema = Joi.object({
  version: semver,
}).required()

class GithubPackageJsonVersion extends ConditionalGithubAuthService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github/package-json/v',
      pattern: ':user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub package.json version',
        pattern: ':user/:repo',
        namedParams: { user: 'IcedFrisby', repo: 'IcedFrisby' },
        staticPreview: this.render({ version: '2.0.0-alpha.2' }),
        documentation,
      },
      {
        title: 'GitHub package.json version (branch)',
        pattern: ':user/:repo/:branch*',
        namedParams: {
          user: 'IcedFrisby',
          repo: 'IcedFrisby',
          branch: 'master',
        },
        staticPreview: this.render({ version: '2.0.0-alpha.2' }),
        documentation,
      },
    ]
  }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'version',
    })
  }

  async handle({ user, repo, branch }) {
    const { version } = await fetchJsonFromRepo(this, {
      schema: versionSchema,
      user,
      repo,
      branch,
      filename: 'package.json',
    })
    return this.constructor.render({ version, branch })
  }
}

class DynamicGithubPackageJson extends ConditionalGithubAuthService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'github/package-json',
      format: '(?!v)([^/]+)/([^/]+)/([^/]+)/?([^/]+)?',
      capture: ['key', 'user', 'repo', 'branch'],
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub package.json dynamic',
        pattern: ':key/:user/:repo',
        namedParams: {
          key: 'keywords',
          user: 'developit',
          repo: 'microbundle',
        },
        staticPreview: this.render({
          key: 'keywords',
          value: ['bundle', 'rollup', 'micro library'],
        }),
        documentation,
      },
      {
        title: 'GitHub package.json dynamic',
        pattern: ':key/:user/:repo/:branch*',
        namedParams: {
          key: 'keywords',
          user: 'developit',
          repo: 'microbundle',
          branch: 'master',
        },
        staticPreview: this.render({
          key: 'keywords',
          value: ['bundle', 'rollup', 'micro library'],
          branch: 'master',
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'package.json',
    }
  }

  static render({ key, value, branch }) {
    return renderDynamicBadge({
      defaultLabel: key,
      tag: branch,
      value,
    })
  }

  async handle({ key, user, repo, branch }) {
    // Not sure `package-json/n` was ever advertised, but it was supported.
    if (key === 'n') {
      key = 'name'
    }
    const data = await fetchJsonFromRepo(this, {
      schema: Joi.object().required(),
      user,
      repo,
      branch,
      filename: 'package.json',
    })
    const value = transformAndValidate({ data, key })
    return this.constructor.render({ key, value, branch })
  }
}

module.exports = {
  GithubPackageJsonVersion,
  DynamicGithubPackageJson,
}
