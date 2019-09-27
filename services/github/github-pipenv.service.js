'use strict'

const { renderVersionBadge } = require('../version')
const { isLockfile, getDependencyVersion } = require('../pipenv-helpers')
const { addv } = require('../text-formatters')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { fetchJsonFromRepo } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')

const keywords = ['pipfile']

class GithubPipenvLockedPythonVersion extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'github/pipenv/locked/python-version',
      pattern: ':user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub Pipenv locked Python version',
        pattern: ':user/:repo',
        namedParams: {
          user: 'metabolize',
          repo: 'rq-dashboard-on-heroku',
        },
        staticPreview: this.render({ version: '3.7' }),
        documentation,
        keywords,
      },
      {
        title: 'GitHub Pipenv locked Python version (branch)',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'metabolize',
          repo: 'rq-dashboard-on-heroku',
          branch: 'master',
        },
        staticPreview: this.render({ version: '3.7' }),
        documentation,
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'python',
    }
  }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'python',
    })
  }

  async handle({ user, repo, branch }) {
    const {
      _meta: {
        requires: { python_version: version },
      },
    } = await fetchJsonFromRepo(this, {
      schema: isLockfile,
      user,
      repo,
      branch,
      filename: 'Pipfile.lock',
    })
    return this.constructor.render({ version, branch })
  }
}

class GithubPipenvLockedDependencyVersion extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'dependencies'
  }

  static get route() {
    return {
      base: 'github/pipenv/locked/dependency-version',
      pattern: ':user/:repo/:kind(dev)?/:packageName/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub Pipenv locked prod dependency version',
        pattern: ':user/:repo/:kind(dev)?/:packageName',
        namedParams: {
          user: 'metabolize',
          repo: 'rq-dashboard-on-heroku',
          packageName: 'rq-dashboard',
        },
        staticPreview: this.render({ version: '2.0.0-alpha.2' }),
        documentation,
        keywords,
      },
      {
        title: 'GitHub Pipenv locked dev dependency version (branch)',
        pattern: ':user/:repo/:kind(dev)?/:packageName/:branch',
        namedParams: {
          user: 'metabolize',
          repo: 'rq-dashboard-on-heroku',
          kind: 'dev',
          packageName: 'black',
          branch: 'master',
        },
        staticPreview: this.render({ dependency: 'black', version: '19.3b0' }),
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

  static render({ dependency, version, branch }) {
    return {
      label: dependency,
      message: addv(version),
      color: 'blue',
    }
  }

  async handle({ user, repo, kind, branch, scope, packageName }) {
    const lockfileData = await fetchJsonFromRepo(this, {
      schema: isLockfile,
      user,
      repo,
      branch,
      filename: 'Pipfile.lock',
    })
    const version = getDependencyVersion({
      kind,
      wantedDependency: packageName,
      lockfileData,
    })
    return this.constructor.render({
      dependency: packageName,
      version,
      branch,
    })
  }
}

module.exports = [
  GithubPipenvLockedPythonVersion,
  GithubPipenvLockedDependencyVersion,
]
