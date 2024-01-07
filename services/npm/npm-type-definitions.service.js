import { pathParam, queryParam } from '../index.js'
import NpmBase, { packageNameDescription } from './npm-base.js'

// For this badge to correctly detect type definitions, either the relevant
// dependencies must be declared, or the `types` key must be set in
// package.json.
export default class NpmTypeDefinitions extends NpmBase {
  static category = 'platform-support'

  static route = this.buildRoute('npm/types', { withTag: false })

  static openApi = {
    '/npm/types/{packageName}': {
      get: {
        summary: 'NPM Type Definitions',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'chalk',
            description: packageNameDescription,
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'types',
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
      queryParams,
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
