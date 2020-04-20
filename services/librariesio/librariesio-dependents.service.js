'use strict'

const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')
const { fetchProject } = require('./librariesio-common')

// https://libraries.io/api#project-dependents
module.exports = class LibrariesIoDependents extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'librariesio/dependents',
      pattern: ':platform/:scope(@[^/]+)?/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Dependents (via libraries.io)',
        pattern: ':platform/:packageName',
        namedParams: {
          platform: 'npm',
          packageName: 'got',
        },
        staticPreview: this.render({ dependentCount: 2000 }),
      },
      {
        title: 'Dependents (via libraries.io), scoped npm package',
        pattern: ':platform/:scope/:packageName',
        namedParams: {
          platform: 'npm',
          scope: '@babel',
          packageName: 'core',
        },
        staticPreview: this.render({ dependentCount: 94 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'dependents',
    }
  }

  static render({ dependentCount }) {
    return {
      message: metric(dependentCount),
      color: dependentCount === 0 ? 'orange' : 'brightgreen',
    }
  }

  async handle({ platform, scope, packageName }) {
    const { dependents_count: dependentCount } = await fetchProject(this, {
      platform,
      scope,
      packageName,
    })
    return this.constructor.render({ dependentCount })
  }
}
