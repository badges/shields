import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { BaseOreService, description } from './ore-base.js'

export default class OreDownloads extends BaseOreService {
  static category = 'downloads'

  static route = {
    base: 'ore/dt',
    pattern: ':pluginId',
  }

  static openApi = {
    '/ore/dt/{pluginId}': {
      get: {
        summary: 'Ore Downloads',
        description,
        parameters: pathParams({
          name: 'pluginId',
          example: 'nucleus',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ pluginId }) {
    const { stats } = await this.fetch({ pluginId })
    return renderDownloadsBadge({ downloads: stats.downloads })
  }
}
