import { renderDownloadsBadge } from '../downloads.js'
import { BaseThunderstoreService, documentation } from './thunderstore-base.js'

export default class ThunderstoreDownloads extends BaseThunderstoreService {
  static category = 'downloads'

  static route = {
    base: 'thunderstore/downloads',
    pattern: ':namespace/:packageName',
  }

  static examples = [
    {
      title: 'Thunderstore Downloads',
      namedParams: {
        namespace: 'notnotnotswipez',
        packageName: 'MoreCompany',
      },
      staticPreview: renderDownloadsBadge({ downloads: 120000 }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'downloads',
    namedLogo: 'thunderstore',
  }

  /**
   * @param {object} pkg - Package specifier
   * @param {string} pkg.namespace - the package namespace
   * @param {string} pkg.packageName - the package name
   * @returns {Promise<*>} - Promise containing the rendered badge payload
   */
  async handle({ namespace, packageName }) {
    const { downloads } = await this.fetchPackageMetrics({
      namespace,
      packageName,
    })
    return renderDownloadsBadge({ downloads })
  }
}
