import { pep440VersionColor } from '../color-formatters.js'
import { renderVersionBadge } from '../version.js'
import { isLockfile, getDependencyVersion } from '../pipenv-helpers.js'
import { addv } from '../text-formatters.js'
import { NotFound } from '../index.js'
import { ConditionalGithubAuthV3Service } from './github-auth-service.js'
import { fetchJsonFromRepo } from './github-common-fetch.js'
import { documentation as githubDocumentation } from './github-helpers.js'

const keywords = ['pipfile']

const documentation = `
[Pipenv](https://github.com/pypa/pipenv) is a dependency
manager for Python which manages a
[virtualenv](https://virtualenv.pypa.io/en/latest/) for
projects. It adds/removes packages from your \`Pipfile\` as
you install/uninstall packages and generates the ever-important
\`Pipfile.lock\`, which can be checked in to source control
in order to produce deterministic builds.

The GitHub Pipenv badges are intended for applications using Pipenv
which are hosted on GitHub.

When \`Pipfile.lock\` is checked in, the <strong>GitHub Pipenv
locked dependency version</strong> badge displays the locked version of
a dependency listed in \`[packages]\` or
\`[dev-packages]\` (or any of their transitive dependencies).

Usually a Python version is specified in the \`Pipfile\`, which
\`pipenv lock\` then places in \`Pipfile.lock\`.
The <strong>GitHub Pipenv Python version</strong> badge displays that version.

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
        branch: 'main',
      },
      staticPreview: this.render({ version: '3.7', branch: 'main' }),
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
      versionFormatter: pep440VersionColor,
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
        branch: 'main',
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
      color: version ? pep440VersionColor(version) : 'blue',
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
