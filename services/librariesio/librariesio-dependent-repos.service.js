'use strict'

const { BaseJsonService } = require('..')
const { metric } = require('../text-formatters')
const { fetchProject } = require('./librariesio-common')

// https://libraries.io/api#project-dependent-repositories
module.exports = class LibrariesIoDependentRepos extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return {
      label: 'dependent repos',
    }
  }

  static get route() {
    return {
      base: 'librariesio/dependent-repos',
      pattern: ':platform/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Dependent repos (via libraries.io)',
        namedParams: {
          platform: 'npm',
          packageName: 'got',
        },
        staticPreview: this.render({ dependentReposCount: 84000 }),
      },
    ]
  }

  static render({ dependentReposCount }) {
    return {
      message: metric(dependentReposCount),
      color: dependentReposCount === 0 ? 'orange' : 'brightgreen',
    }
  }

  async handle({ platform, packageName }) {
    const { dependent_repos_count: dependentReposCount } = await fetchProject(
      this,
      {
        platform,
        packageName,
      }
    )
    return this.constructor.render({ dependentReposCount })
  }
}
