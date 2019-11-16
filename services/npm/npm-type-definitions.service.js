'use strict'

const NpmBase = require('./npm-base')

// For this badge to correctly detect type definitions, either the relevant
// dependencies must be declared, or the `types` key must be set in
// package.json.
module.exports = class NpmTypeDefinitions extends NpmBase {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return this.buildRoute('npm/types', { withTag: false })
  }

  static get examples() {
    return [
      {
        title: 'npm type definitions',
        pattern: ':packageName',
        namedParams: { packageName: 'chalk' },
        staticPreview: this.render({
          supportedLanguages: ['TypeScript', 'Flow'],
        }),
        keywords: ['node', 'typescript', 'flow'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'types' }
  }

  static render({ supportedLanguages }) {
    if (supportedLanguages.length === 0) {
      return { message: 'none', color: 'lightgray' }
    } else {
      return {
        message: supportedLanguages.sort().join(' | '),
        color: 'blue',
      }
    }
  }

  static transform({ devDependencies, types, typings, files }) {
    const supportedLanguages = []

    if (
      types !== undefined ||
      typings !== undefined ||
      devDependencies.typescript !== undefined ||
      files.includes('index.d.ts')
    ) {
      supportedLanguages.push('TypeScript')
    }

    if (
      devDependencies['flow-bin'] !== undefined ||
      files.includes('index.js.flow')
    ) {
      supportedLanguages.push('Flow')
    }

    return { supportedLanguages }
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
