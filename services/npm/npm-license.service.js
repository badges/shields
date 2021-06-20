import { renderLicenseBadge } from '../licenses.js'
import toArray from '../../core/base-service/to-array.js'
import NpmBase from './npm-base.js'

export default class NpmLicense extends NpmBase {
  static category = 'license'

  static route = this.buildRoute('npm/l', { withTag: false })

  static examples = [
    {
      title: 'NPM',
      pattern: ':packageName',
      namedParams: { packageName: 'express' },
      staticPreview: this.render({ licenses: ['MIT'] }),
      keywords: ['node'],
    },
    {
      title: 'NPM',
      pattern: ':packageName',
      namedParams: { packageName: 'express' },
      queryParams: { registry_uri: 'https://registry.npmjs.com' },
      staticPreview: this.render({ licenses: ['MIT'] }),
      keywords: ['node'],
    },
  ]

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, registryUrl } = this.constructor.unpackParams(
      namedParams,
      queryParams
    )
    const { license } = await this.fetchPackageData({
      scope,
      packageName,
      registryUrl,
    })
    const licenses = toArray(license).map(license =>
      typeof license === 'string' ? license : license.type
    )
    return this.constructor.render({ licenses })
  }
}
