'use strict'

const { metric } = require('../../lib/text-formatters')
const LibrariesIoBase = require('./librariesio-base')

// https://libraries.io/api#project-dependents
class LibrariesIoDependents extends LibrariesIoBase {
  static get category() {
    return 'downloads'
  }

  static get defaultBadgeData() {
    return {
      label: 'dependents',
    }
  }

  static get url() {
    return this.buildUrl('librariesio/dependents')
  }

  static get examples() {
    return [
      {
        title: 'Dependents (via libraries.io)',
        previewUrl: 'npm/got',
      },
    ]
  }

  static render({ dependentCount }) {
    return {
      message: metric(dependentCount),
      color: dependentCount === 0 ? 'orange' : 'brightgreen',
    }
  }

  async handle({ platform, packageName }) {
    const { dependents_count: dependentCount } = await this.fetch({
      platform,
      packageName,
    })
    return this.constructor.render({ dependentCount })
  }
}

module.exports = LibrariesIoDependents
