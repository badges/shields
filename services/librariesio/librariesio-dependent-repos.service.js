'use strict'

const { metric } = require('../../lib/text-formatters')
const LibrariesIoBase = require('./librariesio-base')

// https://libraries.io/api#project-dependent-repositories
class LibrariesIoDependentRepos extends LibrariesIoBase {
  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return {
      label: 'dependent repos',
    }
  }

  static get route() {
    return this.buildRoute('librariesio/dependent-repos')
  }

  static get examples() {
    return [
      {
        title: 'Dependent repos (via libraries.io)',
        exampleUrl: 'npm/got',
        pattern: ':platform/:library',
        staticExample: this.render({ dependentReposCount: 84000 }),
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
    const { dependent_repos_count: dependentReposCount } = await this.fetch(
      {
        platform,
        packageName,
      },
      { allowPackages: true }
    )
    return this.constructor.render({ dependentReposCount })
  }
}

module.exports = LibrariesIoDependentRepos
