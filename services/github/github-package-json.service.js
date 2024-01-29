import Joi from 'joi'
import { pathParam, pathParams, queryParam } from '../index.js'
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

  static openApi = {
    '/github/package-json/v/{user}/{repo}': {
      get: {
        summary: 'GitHub package.json version',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          queryParam({ name: 'filename', example: 'badge-maker/package.json' }),
        ],
      },
    },
    '/github/package-json/v/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub package.json version (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({ name: 'branch', example: 'master' }),
          queryParam({ name: 'filename', example: 'badge-maker/package.json' }),
        ],
      },
    },
  }

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

const packageNameDescription =
  'This may be the name of an unscoped package like `package-name` or a [scoped package](https://docs.npmjs.com/about-scopes) like `@author/package-name`'

class GithubPackageJsonDependencyVersion extends ConditionalGithubAuthV3Service {
  static category = 'platform-support'
  static route = {
    base: 'github/package-json/dependency-version',
    pattern:
      ':user/:repo/:kind(dev|peer|optional)?/:scope(@[^/]+)?/:packageName/:branch*',
    queryParamSchema: subfolderQueryParamSchema,
  }

  static openApi = {
    '/github/package-json/dependency-version/{user}/{repo}/{packageName}': {
      get: {
        summary: 'GitHub package.json prod dependency version',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          pathParam({
            name: 'packageName',
            example: 'dayjs',
            description: packageNameDescription,
          }),
          queryParam({
            name: 'filename',
            example: 'badge-maker/package.json',
          }),
        ],
      },
    },
    '/github/package-json/dependency-version/{user}/{repo}/{packageName}/{branch}':
      {
        get: {
          summary: 'GitHub package.json prod dependency version (branch)',
          description: documentation,
          parameters: [
            pathParam({ name: 'user', example: 'badges' }),
            pathParam({ name: 'repo', example: 'shields' }),
            pathParam({
              name: 'packageName',
              example: 'dayjs',
              description: packageNameDescription,
            }),
            pathParam({ name: 'branch', example: 'master' }),
            queryParam({
              name: 'filename',
              example: 'badge-maker/package.json',
            }),
          ],
        },
      },
    '/github/package-json/dependency-version/{user}/{repo}/{kind}/{packageName}':
      {
        get: {
          summary: 'GitHub package.json dev/peer/optional dependency version',
          description: documentation,
          parameters: [
            pathParam({ name: 'user', example: 'gatsbyjs' }),
            pathParam({ name: 'repo', example: 'gatsby' }),
            pathParam({
              name: 'kind',
              example: 'dev',
              schema: { type: 'string', enum: this.getEnum('kind') },
            }),
            pathParam({
              name: 'packageName',
              example: 'cross-env',
              description: packageNameDescription,
            }),
            queryParam({
              name: 'filename',
              example: 'packages/gatsby-cli/package.json',
            }),
          ],
        },
      },
    '/github/package-json/dependency-version/{user}/{repo}/{kind}/{packageName}/{branch}':
      {
        get: {
          summary:
            'GitHub package.json dev/peer/optional dependency version (branch)',
          description: documentation,
          parameters: [
            pathParam({ name: 'user', example: 'gatsbyjs' }),
            pathParam({ name: 'repo', example: 'gatsby' }),
            pathParam({
              name: 'kind',
              example: 'dev',
              schema: { type: 'string', enum: this.getEnum('kind') },
            }),
            pathParam({
              name: 'packageName',
              example: 'cross-env',
              description: packageNameDescription,
            }),
            pathParam({ name: 'branch', example: 'master' }),
            queryParam({
              name: 'filename',
              example: 'packages/gatsby-cli/package.json',
            }),
          ],
        },
      },
  }

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
    { filename = 'package.json' },
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
    const range = getDependencyVersion({
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

  static openApi = {
    '/github/package-json/{key}/{user}/{repo}': {
      get: {
        summary: 'GitHub package.json dynamic',
        description: documentation,
        parameters: pathParams(
          {
            name: 'key',
            example: 'keywords',
            description: 'any key in package.json',
          },
          { name: 'user', example: 'developit' },
          { name: 'repo', example: 'microbundle' },
        ),
      },
    },
    '/github/package-json/{key}/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub package.json dynamic (branch)',
        description: documentation,
        parameters: pathParams(
          {
            name: 'key',
            example: 'keywords',
            description: 'any key in package.json',
          },
          { name: 'user', example: 'developit' },
          { name: 'repo', example: 'microbundle' },
          { name: 'branch', example: 'master' },
        ),
      },
    },
  }

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
