import { pathParam, queryParam } from '../index.js'
import { renderLicenseBadge } from '../licenses.js'
import toArray from '../../core/base-service/to-array.js'
import NpmBase, { packageNameDescription } from './npm-base.js'

export default class NpmLicense extends NpmBase {
  static category = 'license'

  static route = this.buildRoute('npm/l', { withTag: false })

  static openApi = {
    '/npm/l/{packageName}': {
      get: {
        summary: 'NPM License',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'express',
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

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, registryUrl } = this.constructor.unpackParams(
      namedParams,
      queryParams,
    )
    const { license } = await this.fetchPackageData({
      scope,
      packageName,
      registryUrl,
    })
    const licenses = toArray(license).map(license =>
      typeof license === 'string' ? license : license.type,
    )
    return this.constructor.render({ licenses })
  }
}
