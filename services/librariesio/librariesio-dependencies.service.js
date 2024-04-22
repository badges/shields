import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { pathParams } from '../index.js'
import LibrariesIoBase from './librariesio-base.js'
import {
  transform,
  renderDependenciesBadge,
} from './librariesio-dependencies-helpers.js'

const projectDependenciesSchema = Joi.object({
  dependencies: Joi.array()
    .items(
      Joi.object({
        deprecated: Joi.boolean().allow(null).required(),
        outdated: Joi.boolean().allow(null).required(),
      }),
    )
    .default([]),
}).required()

const repoDependenciesSchema = Joi.object({
  deprecated_count: nonNegativeInteger,
  outdated_count: nonNegativeInteger,
}).required()

class LibrariesIoProjectDependencies extends LibrariesIoBase {
  static category = 'dependencies'

  static route = {
    base: 'librariesio/release',
    pattern: ':platform/:scope(@[^/]+)?/:packageName/:version?',
  }

  static openApi = {
    '/librariesio/release/{platform}/{packageName}': {
      get: {
        summary: 'Libraries.io dependency status for latest release',
        parameters: pathParams(
          { name: 'platform', example: 'npm' },
          { name: 'packageName', example: '@babel/core' },
        ),
      },
    },
    '/librariesio/release/{platform}/{packageName}/{version}': {
      get: {
        summary: 'Libraries.io dependency status for specific release',
        parameters: pathParams(
          { name: 'platform', example: 'npm' },
          { name: 'packageName', example: '@babel/core' },
          { name: 'version', example: '7.0.0' },
        ),
      },
    },
  }

  static _cacheLength = 900

  async handle({ platform, scope, packageName, version = 'latest' }) {
    const url = `/${encodeURIComponent(platform)}/${
      scope ? encodeURIComponent(`${scope}/`) : ''
    }${encodeURIComponent(packageName)}/${encodeURIComponent(
      version,
    )}/dependencies`
    const json = await this._requestJson({
      url,
      schema: projectDependenciesSchema,
      httpErrors: { 404: 'package or version not found' },
    })
    const { deprecatedCount, outdatedCount } = transform(json)
    return renderDependenciesBadge({ deprecatedCount, outdatedCount })
  }
}

class LibrariesIoRepoDependencies extends LibrariesIoBase {
  static category = 'dependencies'

  static route = {
    base: 'librariesio/github',
    pattern: ':user/:repo',
  }

  static openApi = {
    '/librariesio/github/{user}/{repo}': {
      get: {
        summary: 'Libraries.io dependency status for GitHub repo',
        parameters: pathParams(
          { name: 'user', example: 'phoenixframework' },
          { name: 'repo', example: 'phoenix' },
        ),
      },
    },
  }

  static _cacheLength = 900

  async handle({ user, repo }) {
    const url = `/github/${encodeURIComponent(user)}/${encodeURIComponent(
      repo,
    )}/shields_dependencies`

    const { deprecated_count: deprecatedCount, outdated_count: outdatedCount } =
      await this._requestJson({
        url,
        schema: repoDependenciesSchema,
        httpErrors: {
          404: 'repo not found',
        },
      })
    return renderDependenciesBadge({ deprecatedCount, outdatedCount })
  }
}

export default [LibrariesIoProjectDependencies, LibrariesIoRepoDependencies]
