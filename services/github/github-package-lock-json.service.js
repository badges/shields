'use strict'

const { renderVersionBadge } = require('../version')
const {
  transformAndValidate,
  renderDynamicBadge,
} = require('../dynamic-common')
const {
  isPackageLockJsonWithDependencies,
  getLockDependencyVersion,
} = require('../package-lock-json-helpers')
const { semver } = require('../validators')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { fetchJsonFromRepo } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')
const Joi = require('@hapi/joi')

const keywords = ['npm', 'node']

const versionSchema = Joi.object({
  version: semver,
}).required()

// Leave this for completion's sake.
// Usually you'll go ahead and get the version from package.json instead.
class GithubPackageLockJsonVersion extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github/package-lock-json/v',
      pattern: ':user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub package-lock.json version',
        pattern: ':user/:repo',
        namedParams: { user: 'IcedFrisby', repo: 'IcedFrisby' },
        staticPreview: this.render({ version: '3.0.0' }),
        documentation,
        keywords,
      },
      {
        title: 'GitHub package-lock.json version (branch)',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'IcedFrisby',
          repo: 'IcedFrisby',
          branch: 'master',
        },
        staticPreview: this.render({ version: '3.0.0' }),
        documentation,
        keywords,
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
      filename: 'package-lock.json',
    })
    return this.constructor.render({ version, branch })
  }
}

const dependencyQueryParamSchema = Joi.object({
  filename: Joi.string(),
}).required()

class GithubPackageLockJsonDependencyVersion extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'github/package-lock-json/dependency-version',
      pattern: ':user/:repo/:scope(@[^/]+)?/:packageName/:branch*',
      queryParamSchema: dependencyQueryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub package-lock.json dependency version',
        pattern: ':user/:repo/:packageName',
        namedParams: {
          user: 'developit',
          repo: 'microbundle',
          packageName: 'rollup',
        },
        staticPreview: this.render({
          dependency: 'rollup',
          range: '1.29.1',
        }),
        documentation,
        keywords,
      },
      {
        title: 'GitHub package-lock.json dependency version (on branch)',
        pattern: ':user/:repo/dev/:scope?/:packageName/:branch*',
        namedParams: {
          user: 'octokit',
          repo: 'rest.js',
          branch: 'master',
          scope: '@babel',
          packageName: 'core',
        },
        staticPreview: this.render({
          dependency: '@babel/core',
          range: '7.8.4',
        }),
        documentation,
        keywords,
      },
      {
        title:
          'GitHub package-lock.json dependency version (subfolder of monorepo)',
        pattern: ':user/:repo/:packageName',
        namedParams: {
          user: 'OriginProtocol',
          repo: 'origin',
          packageName: 'davidshimjs-qrcodejs',
        },
        queryParams: {
          filename: 'origin/dapps/marketplace/package-lock.json',
        },
        staticPreview: this.render({
          dependency: 'davidshimjs-qrcodejs',
          range: '0.0.2',
        }),
        documentation,
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'locked dependency',
    }
  }

  static render({ dependency, range }) {
    return {
      label: dependency,
      message: range,
      color: 'blue',
    }
  }

  async handle(
    { user, repo, branch = 'master', scope, packageName },
    { filename = 'package-lock.json' }
  ) {
    const { dependencies } = await fetchJsonFromRepo(this, {
      schema: isPackageLockJsonWithDependencies,
      user,
      repo,
      branch,
      filename,
    })

    const wantedDependency = scope ? `${scope}/${packageName}` : packageName
    const { range } = getLockDependencyVersion({
      wantedDependency,
      dependencies,
    })

    return this.constructor.render({
      dependency: wantedDependency,
      range,
    })
  }
}

// This must be exported after GithubPackageLockJsonVersion in order for the
// former to work correctly.
class DynamicGithubPackageLockJson extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'github/package-lock-json',
      pattern: ':key/:user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub package-lock.json dynamic',
        pattern: ':key/:user/:repo',
        namedParams: {
          key: 'lockfileVersion',
          user: 'developit',
          repo: 'microbundle',
        },
        staticPreview: this.render({
          key: 'lockfileVersion',
          value: '1',
        }),
        documentation,
        keywords,
      },
      {
        title: 'GitHub package-lock.json dynamic',
        pattern: ':key/:user/:repo/:branch',
        namedParams: {
          key: 'lockfileVersion',
          user: 'developit',
          repo: 'microbundle',
          branch: 'master',
        },
        staticPreview: this.render({
          key: 'lockfileVersion',
          value: '1',
          branch: 'master',
        }),
        documentation,
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'package-lock.json',
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
    // `package-json/n` is supported, so also support `package-lock-json/n`.
    if (key === 'n') {
      key = 'name'
    }
    const data = await fetchJsonFromRepo(this, {
      schema: Joi.object().required(),
      user,
      repo,
      branch,
      filename: 'package-lock.json',
    })
    const value = transformAndValidate({ data, key })
    return this.constructor.render({ key, value, branch })
  }
}

module.exports = [
  GithubPackageLockJsonVersion,
  GithubPackageLockJsonDependencyVersion,
  DynamicGithubPackageLockJson,
]
