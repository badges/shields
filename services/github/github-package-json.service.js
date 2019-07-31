'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const {
  transformAndValidate,
  renderDynamicBadge,
} = require('../dynamic-common')
const {
  isPackageJsonWithDependencies,
  getDependencyVersion,
} = require('../package-json-helpers')
const { semver } = require('../validators')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { fetchJsonFromRepo } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')

const keywords = ['npm', 'node']

const versionSchema = Joi.object({
  version: semver,
}).required()

class GithubPackageJsonVersion extends ConditionalGithubAuthV3Service {
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
        keywords,
      },
      {
        title: 'GitHub package.json version (branch)',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'IcedFrisby',
          repo: 'IcedFrisby',
          branch: 'master',
        },
        staticPreview: this.render({ version: '2.0.0-alpha.2' }),
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
      filename: 'package.json',
    })
    return this.constructor.render({ version, branch })
  }
}

class GithubPackageJsonDependencyVersion extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'github/package-json/dependency-version',
      pattern:
        ':user/:repo/:kind(dev|peer)?/:scope(@[^/]+)?/:packageName/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub package.json dependency version (prod)',
        pattern: ':user/:repo/:packageName',
        namedParams: {
          user: 'developit',
          repo: 'microbundle',
          packageName: 'rollup',
        },
        staticPreview: this.render({
          dependency: 'rollup',
          range: '^0.67.3',
        }),
        documentation,
        keywords,
      },
      {
        title: 'GitHub package.json dependency version (dev dep on branch)',
        pattern: ':user/:repo/dev/:scope?/:packageName/:branch*',
        namedParams: {
          user: 'zeit',
          repo: 'next.js',
          branch: 'canary',
          scope: '@babel',
          packageName: 'preset-react',
        },
        staticPreview: this.render({
          dependency: '@babel/preset-react',
          range: '7.0.0',
        }),
        documentation,
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'dependency',
    }
  }

  static render({ dependency, range }) {
    return {
      label: dependency,
      message: range,
      color: 'blue',
    }
  }

  async handle({ user, repo, kind, branch = 'master', scope, packageName }) {
    const {
      dependencies,
      devDependencies,
      peerDependencies,
    } = await fetchJsonFromRepo(this, {
      schema: isPackageJsonWithDependencies,
      user,
      repo,
      branch,
      filename: 'package.json',
    })

    const wantedDependency = scope ? `${scope}/${packageName}` : packageName
    const { range } = getDependencyVersion({
      kind,
      wantedDependency,
      dependencies,
      devDependencies,
      peerDependencies,
    })

    return this.constructor.render({
      dependency: wantedDependency,
      range,
    })
  }
}

// This must be exported after GithubPackageJsonVersion in order for the
// former to work correctly.
class DynamicGithubPackageJson extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'github/package-json',
      pattern: ':key/:user/:repo/:branch*',
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
        keywords,
      },
      {
        title: 'GitHub package.json dynamic',
        pattern: ':key/:user/:repo/:branch',
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
        keywords,
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

module.exports = [
  GithubPackageJsonVersion,
  GithubPackageJsonDependencyVersion,
  DynamicGithubPackageJson,
]
