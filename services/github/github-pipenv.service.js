import { renderVersionBadge } from '../version.js'
import { isLockfile, getDependencyVersion } from '../pipenv-helpers.js'
import { addv } from '../text-formatters.js'
import { NotFound } from '../index.js'
import { ConditionalGithubAuthV3Service } from './github-auth-service.js'
import { fetchJsonFromRepo } from './github-common-fetch.js'
import { documentation as githubDocumentation } from './github-helpers.js'

const keywords = ['pipfile']

const documentation = `
<p>
  <a href="https://github.com/pypa/pipenv">Pipenv</a> is a dependency
  manager for Python which manages a
  <a href="https://virtualenv.pypa.io/en/latest/">virtualenv</a> for
  projects. It adds/removes packages from your <code>Pipfile</code> as
  you install/uninstall packages and generates the ever-important
  <code>Pipfile.lock</code>, which can be checked in to source control
  in order to produce deterministic builds.
</p>

<p>
  The GitHub Pipenv badges are intended for applications using Pipenv
  which are hosted on GitHub.
</p>

<p>
  When <code>Pipfile.lock</code> is checked in, the <strong>GitHub Pipenv
  locked dependency version</strong> badge displays the locked version of
  a dependency listed in <code>[packages]</code> or
  <code>[dev-packages]</code> (or any of their transitive dependencies).
</p>

<p>
  Usually a Python version is specified in the <code>Pipfile</code>, which
  <code>pipenv lock</code> then places in <code>Pipfile.lock</code>. The
  <strong>GitHub Pipenv Python version</strong> badge displays that version.
</p>

${githubDocumentation}
`

class GithubPipenvLockedPythonVersion extends ConditionalGithubAuthV3Service {
  static category = 'platform-support'
  static route = {
    base: 'github/pipenv/locked/python-version',
    pattern: ':user/:repo/:branch*',
  }

  static examples = [
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
      staticPreview: this.render({ version: '3.7', branch: 'master' }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'python' }

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
    if (version === undefined) {
      throw new NotFound({ prettyMessage: 'version not specified' })
    }
    return this.constructor.render({ version, branch })
  }
}

class GithubPipenvLockedDependencyVersion extends ConditionalGithubAuthV3Service {
  static category = 'dependencies'
  static route = {
    base: 'github/pipenv/locked/dependency-version',
    pattern: ':user/:repo/:kind(dev)?/:packageName/:branch*',
  }

  static examples = [
    {
      title: 'GitHub Pipenv locked dependency version',
      pattern: ':user/:repo/:kind(dev)?/:packageName',
      namedParams: {
        user: 'metabolize',
        repo: 'rq-dashboard-on-heroku',
        packageName: 'flask',
      },
      staticPreview: this.render({
        dependency: 'flask',
        version: '1.1.1',
      }),
      documentation,
      keywords: ['python', ...keywords],
    },
    {
      title: 'GitHub Pipenv locked dependency version (branch)',
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
      keywords: ['python', ...keywords],
    },
  ]

  static defaultBadgeData = { label: 'dependency' }

  static render({ dependency, version, ref }) {
    return {
      label: dependency,
      message: version ? addv(version) : ref,
      color: 'blue',
    }
  }

  async handle({ user, repo, kind, branch, packageName }) {
    const lockfileData = await fetchJsonFromRepo(this, {
      schema: isLockfile,
      user,
      repo,
      branch,
      filename: 'Pipfile.lock',
    })
    const { version, ref } = getDependencyVersion({
      kind,
      wantedDependency: packageName,
      lockfileData,
    })
    return this.constructor.render({
      dependency: packageName,
      version,
      ref,
    })
  }
}

export default [
  GithubPipenvLockedPythonVersion,
  GithubPipenvLockedDependencyVersion,
]
