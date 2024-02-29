import Joi from 'joi'
import { pathParams } from '../index.js'
import LibrariesIoBase from './librariesio-base.js'
import {
  transform,
  renderDependenciesBadge,
} from './librariesio-dependencies-helpers.js'

const schema = Joi.object({
  dependencies: Joi.array()
    .items(
      Joi.object({
        deprecated: Joi.boolean().allow(null).required(),
        outdated: Joi.boolean().allow(null).required(),
      }),
    )
    .default([]),
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
      schema,
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
    )}/dependencies`
    const json = await this._requestJson({
      url,
      schema,
      httpErrors: {
        404: 'repo not found',
      },
    })
    const { deprecatedCount, outdatedCount } = transform(json)
    return renderDependenciesBadge({ deprecatedCount, outdatedCount })
  }
}

export default [LibrariesIoProjectDependencies, LibrariesIoRepoDependencies]
