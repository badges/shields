import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { transformAndValidate, renderDynamicBadge } from '../dynamic-common.js'
import {
  isPackageJsonWithDependencies,
  getDependencyVersion,
} from '../package-json-helpers.js'
import { semver } from '../validators.js'
import { ConditionalGithubAuthV3Service } from './github-auth-service.js'
import { fetchJsonFromRepo } from './github-common-fetch.js'
import { documentation } from './github-helpers.js'

const keywords = ['npm', 'node']

const versionSchema = Joi.object({
  version: semver,
}).required()

const subfolderQueryParamSchema = Joi.object({
  filename: Joi.string(),
}).required()

class GithubPackageJsonVersion extends ConditionalGithubAuthV3Service {
  static category = 'version'
  static route = {
    base: 'github/package-json/v',
    pattern: ':user/:repo/:branch*',
    queryParamSchema: subfolderQueryParamSchema,
  }

  static examples = [
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
    {
      title: 'GitHub package.json version (subfolder of monorepo)',
      pattern: ':user/:repo',
      namedParams: {
        user: 'metabolize',
        repo: 'anafanafo',
      },
      queryParams: {
        filename: 'packages/char-width-table-builder/package.json',
      },
      staticPreview: this.render({ version: '2.0.0' }),
      documentation,
      keywords,
    },
  ]

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'version',
    })
  }

  async handle({ user, repo, branch }, { filename = 'package.json' }) {
    const { version } = await fetchJsonFromRepo(this, {
      schema: versionSchema,
      user,
      repo,
      branch,
      filename,
    })
    return this.constructor.render({ version, branch })
  }
}

class GithubPackageJsonDependencyVersion extends ConditionalGithubAuthV3Service {
  static category = 'platform-support'
  static route = {
    base: 'github/package-json/dependency-version',
    pattern:
      ':user/:repo/:kind(dev|peer|optional)?/:scope(@[^/]+)?/:packageName/:branch*',
    queryParamSchema: subfolderQueryParamSchema,
  }

  static examples = [
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
    {
      title: 'GitHub package.json dependency version (subfolder of monorepo)',
      pattern: ':user/:repo/:packageName',
      namedParams: {
        user: 'metabolize',
        repo: 'anafanafo',
        packageName: 'puppeteer',
      },
      queryParams: {
        filename: 'packages/char-width-table-builder/package.json',
      },
      staticPreview: this.render({
        dependency: 'puppeteer',
        range: '^1.14.0',
      }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'dependency' }

  static render({ dependency, range }) {
    return {
      label: dependency,
      message: range,
      color: 'blue',
    }
  }

  async handle(
    { user, repo, kind, branch = 'HEAD', scope, packageName },
    { filename = 'package.json' }
  ) {
    const {
      dependencies,
      devDependencies,
      peerDependencies,
      optionalDependencies,
    } = await fetchJsonFromRepo(this, {
      schema: isPackageJsonWithDependencies,
      user,
      repo,
      branch,
      filename,
    })

    const wantedDependency = scope ? `${scope}/${packageName}` : packageName
    const { range } = getDependencyVersion({
      kind,
      wantedDependency,
      dependencies,
      devDependencies,
      peerDependencies,
      optionalDependencies,
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
  static category = 'other'
  static route = {
    base: 'github/package-json',
    pattern: ':key/:user/:repo/:branch*',
  }

  static examples = [
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

  static defaultBadgeData = { label: 'package.json' }

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

export default [
  GithubPackageJsonVersion,
  GithubPackageJsonDependencyVersion,
  DynamicGithubPackageJson,
]
