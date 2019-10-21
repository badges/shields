'use strict'

const Joi = require('@hapi/joi')
const {
  transform,
  renderDependenciesBadge,
} = require('./librariesio-dependencies-helpers')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  dependencies: Joi.array()
    .items(
      Joi.object({
        deprecated: Joi.boolean()
          .allow(null)
          .required(),
        outdated: Joi.boolean()
          .allow(null)
          .required(),
      })
    )
    .default([]),
}).required()

class LibrariesIoProjectDependencies extends BaseJsonService {
  static get category() {
    return 'dependencies'
  }

  static get route() {
    return {
      base: 'librariesio/release',
      pattern: ':platform/:scope(@[^/]+)?/:packageName/:version?',
    }
  }

  static get examples() {
    return [
      {
        title: 'Libraries.io dependency status for latest release',
        pattern: ':platform/:packageName',
        namedParams: {
          platform: 'hex',
          packageName: 'phoenix',
        },
        staticPreview: renderDependenciesBadge({
          deprecatedCount: 0,
          outdatedCount: 1,
        }),
      },
      {
        title: 'Libraries.io dependency status for specific release',
        pattern: ':platform/:packageName/:version',
        namedParams: {
          platform: 'hex',
          packageName: 'phoenix',
          version: '1.0.3',
        },
        staticPreview: renderDependenciesBadge({
          deprecatedCount: 0,
          outdatedCount: 3,
        }),
      },
      {
        title:
          'Libraries.io dependency status for latest release, scoped npm package',
        pattern: ':platform/:scope/:packageName',
        namedParams: {
          platform: 'npm',
          scope: '@babel',
          packageName: 'core',
        },
        staticPreview: renderDependenciesBadge({
          deprecatedCount: 8,
          outdatedCount: 0,
        }),
      },
      {
        title:
          'Libraries.io dependency status for specific release, scoped npm package',
        pattern: ':platform/:scope/:packageName/:version',
        namedParams: {
          platform: 'npm',
          scope: '@babel',
          packageName: 'core',
          version: '7.0.0',
        },
        staticPreview: renderDependenciesBadge({
          deprecatedCount: 12,
          outdatedCount: 0,
        }),
      },
    ]
  }

  async handle({ platform, scope, packageName, version = 'latest' }) {
    const url = `https://libraries.io/api/${encodeURIComponent(platform)}/${
      scope ? encodeURIComponent(`${scope}/`) : ''
    }${encodeURIComponent(packageName)}/${encodeURIComponent(
      version
    )}/dependencies`
    const json = await this._requestJson({
      url,
      schema,
      errorMessages: { 404: 'package or version not found' },
    })
    const { deprecatedCount, outdatedCount } = transform(json)
    return renderDependenciesBadge({ deprecatedCount, outdatedCount })
  }
}

class LibrariesIoRepoDependencies extends BaseJsonService {
  static get category() {
    return 'dependencies'
  }

  static get route() {
    return {
      base: 'librariesio/github',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'Libraries.io dependency status for GitHub repo',
        namedParams: {
          user: 'phoenixframework',
          repo: 'phoenix',
        },
        staticPreview: renderDependenciesBadge({ outdatedCount: 325 }),
      },
    ]
  }

  async handle({ user, repo }) {
    const url = `https://libraries.io/api/github/${encodeURIComponent(
      user
    )}/${encodeURIComponent(repo)}/dependencies`
    const json = await this._requestJson({
      url,
      schema,
      errorMessages: {
        404: 'repo not found',
      },
    })
    const { deprecatedCount, outdatedCount } = transform(json)
    return renderDependenciesBadge({ deprecatedCount, outdatedCount })
  }
}

module.exports = [LibrariesIoProjectDependencies, LibrariesIoRepoDependencies]
