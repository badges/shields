'use strict'

const {
  isPackageLockJsonWithDependencies,
  getLockDependencyVersion,
} = require('../package-lock-json-helpers')
const { fetchJsonFromRepo } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')
const { BaseJsonService } = require('..')
const Joi = require('@hapi/joi')

const keywords = ['npm', 'node']

const dependencyQueryParamSchema = Joi.object({
  filename: Joi.string(),
}).required()

class GithubPackageLockJsonDependencyVersion extends BaseJsonService {
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

module.exports = [GithubPackageLockJsonDependencyVersion]
