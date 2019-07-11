'use strict'

const { metric } = require('../text-formatters')
const { fetchProject } = require('./librariesio-common')
const { BaseJsonService } = require('..')

// https://libraries.io/api#project-dependents
module.exports = class LibrariesIoDependents extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'librariesio/dependents',
      pattern: ':platform/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Dependents (via libraries.io)',
        namedParams: {
          platform: 'npm',
          packageName: 'got',
        },
        staticPreview: this.render({ dependentCount: 2000 }),
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

  async handle({ platform, packageName }) {
    const { dependents_count: dependentCount } = await fetchProject(this, {
      platform,
      packageName,
    })
    return this.constructor.render({ dependentCount })
  }
}
