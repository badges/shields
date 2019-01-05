'use strict'

const NpmBase = require('./npm-base')

const keywords = ['node']

module.exports = class NpmCollaborators extends NpmBase {
  static get category() {
    return 'activity'
  }

  static get route() {
    return this.buildRoute('npm/collaborators', { withTag: false })
  }

  static get examples() {
    return [
      {
        title: 'npm collaborators',
        pattern: ':packageName',
        namedParams: { packageName: 'prettier' },
        staticPreview: this.render({ collaborators: 6 }),
        keywords,
      },
      {
        title: 'npm collaborators',
        pattern: ':packageName',
        namedParams: { packageName: 'prettier' },
        queryParams: { registry_uri: 'https://registry.npmjs.com' },
        staticPreview: this.render({ collaborators: 6 }),
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'npm collaborators',
    }
  }

  static render({ collaborators }) {
    let color
    if (collaborators > 2) {
      color = 'blue'
    } else if (collaborators === 2) {
      color = 'yellow'
    } else {
      color = 'red'
    }

    return {
      message: collaborators,
      color,
    }
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, registryUrl } = this.constructor.unpackParams(
      namedParams,
      queryParams
    )
    const { maintainers } = await this.fetchPackageData({
      scope,
      packageName,
      registryUrl,
    })
    const collaborators = maintainers.length
    return this.constructor.render({ collaborators })
  }
}
