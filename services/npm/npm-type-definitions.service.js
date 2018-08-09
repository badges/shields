'use strict'

const { rangeStart, minor } = require('../../lib/version')
const NpmBase = require('./npm-base')

module.exports = class NpmTypeDefinitions extends NpmBase {
  static get category() {
    return 'version'
  }

  static get defaultBadgeData() {
    return { label: 'type definitions' }
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

  static transform({ devDependencies }) {
    return {
      supportedLanguages: [
        { language: 'TypeScript', range: devDependencies.typescript },
        { language: 'Flow', range: devDependencies['flow-bin'] },
      ].filter(({ range }) => range !== undefined),
    }
  }

  static render({ supportedLanguages }) {
    if (supportedLanguages.length === 0) {
      return { message: 'none', color: 'lightgray' }
    } else {
      return {
        message: supportedLanguages
          .map(
            ({ language, range }) => `${language} v${minor(rangeStart(range))}`
          )
          .join(' | '),
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
