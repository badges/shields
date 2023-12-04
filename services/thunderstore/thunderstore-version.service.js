import { renderVersionBadge } from '../version.js'
import { BaseThunderstoreService, documentation } from './thunderstore-base.js'

export default class ThunderstoreVersion extends BaseThunderstoreService {
  static category = 'version'

  static route = {
    base: 'thunderstore/version',
    pattern: ':namespace/:packageName',
  }

  static examples = [
    {
      title: 'Thunderstore Version',
      namedParams: {
        namespace: 'notnotnotswipez',
        packageName: 'MoreCompany',
      },
      staticPreview: renderVersionBadge({ version: '1.4.5' }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'thunderstore',
    namedLogo: 'thunderstore',
  }

  /**
   * @param {object} pkg - Package specifier
   * @param {string} pkg.namespace - the package namespace
   * @param {string} pkg.packageName - the package name
   * @returns {Promise<*>} - Promise containing the rendered badge payload
   */
  async handle({ namespace, packageName }) {
    const {
      latest: { version_number: version },
    } = await this.fetchPackage({ namespace, packageName })
    return renderVersionBadge({ version })
  }
}
