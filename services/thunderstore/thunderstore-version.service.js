import { renderVersionBadge } from '../version.js'
import { pathParams } from '../index.js'
import { BaseThunderstoreService, description } from './thunderstore-base.js'

export default class ThunderstoreVersion extends BaseThunderstoreService {
  static category = 'version'

  static route = {
    base: 'thunderstore/v',
    pattern: ':namespace/:packageName',
  }

  static openApi = {
    '/thunderstore/v/{namespace}/{packageName}': {
      get: {
        summary: 'Thunderstore Version',
        description,
        parameters: pathParams(
          { name: 'namespace', example: 'notnotnotswipez' },
          { name: 'packageName', example: 'MoreCompany' },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'thunderstore',
  }

  /**
   * @param {object} pkg - Package specifier
   * @param {string} pkg.namespace - the package namespace
   * @param {string} pkg.packageName - the package name
   * @returns {Promise<object>} - Promise containing the rendered badge payload
   */
  async handle({ namespace, packageName }) {
    const { latest_version: version } = await this.fetchPackageMetrics({
      namespace,
      packageName,
    })
    return renderVersionBadge({ version })
  }
}
