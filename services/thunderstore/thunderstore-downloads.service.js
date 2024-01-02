import { renderDownloadsBadge } from '../downloads.js'
import { pathParams } from '../index.js'
import { BaseThunderstoreService, description } from './thunderstore-base.js'

export default class ThunderstoreDownloads extends BaseThunderstoreService {
  static category = 'downloads'

  static route = {
    base: 'thunderstore/dt',
    pattern: ':namespace/:packageName',
  }

  static openApi = {
    '/thunderstore/dt/{namespace}/{packageName}': {
      get: {
        summary: 'Thunderstore Downloads',
        description,
        parameters: pathParams(
          { name: 'namespace', example: 'notnotnotswipez' },
          { name: 'packageName', example: 'MoreCompany' },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'downloads',
  }

  /**
   * @param {object} pkg - Package specifier
   * @param {string} pkg.namespace - the package namespace
   * @param {string} pkg.packageName - the package name
   * @returns {Promise<object>} - Promise containing the rendered badge payload
   */
  async handle({ namespace, packageName }) {
    const { downloads } = await this.fetchPackageMetrics({
      namespace,
      packageName,
    })
    return renderDownloadsBadge({ downloads })
  }
}
