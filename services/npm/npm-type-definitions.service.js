'use strict'

const { rangeStart, minor } = require('../../lib/version')
const NpmBase = require('./npm-base')

// For this badge to correctly detect type definitions, either the relevant
// dependencies must be declared, or the `types` key must be set in
// package.json.
module.exports = class NpmTypeDefinitions extends NpmBase {
  static get category() {
    return 'version'
  }

  static get defaultBadgeData() {
    return { label: 'types' }
  }

  static get url() {
    return this.buildUrl('npm/types', { withTag: false })
  }

  static get examples() {
    return [
      {
        title: 'npm type definitions',
        previewUrl: 'chalk',
        keywords: ['node', 'typescript', 'flow'],
      },
    ]
  }

  static transform({ devDependencies, types }) {
    const supportedLanguages = []

    if (types !== undefined || devDependencies.typescript !== undefined) {
      supportedLanguages.push('TypeScript')
    }

    if (devDependencies['flow-bin'] !== undefined) {
      supportedLanguages.push('Flow')
    }

    return { supportedLanguages }
  }

  static render({ supportedLanguages }) {
    if (supportedLanguages.length === 0) {
      return { message: 'none', color: 'lightgray' }
    } else {
      return {
        message: supportedLanguages.join(' | '),
        color: 'blue',
      }
    }
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, registryUrl } = this.constructor.unpackParams(
      namedParams,
      queryParams
    )
    const json = await this.fetchPackageData({
      scope,
      packageName,
      registryUrl,
    })
    const props = this.constructor.transform(json)
    return this.constructor.render(props)
  }
}
