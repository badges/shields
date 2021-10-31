import { renderDownloadsBadge } from '../downloads.js'
import { BaseOreService, documentation, keywords } from './ore-base.js'

export default class OreDownloads extends BaseOreService {
  static category = 'downloads'

  static route = {
    base: 'ore/dt',
    pattern: ':pluginId',
  }

  static examples = [
    {
      title: 'Ore Downloads',
      namedParams: { pluginId: 'nucleus' },
      staticPreview: renderDownloadsBadge({ downloads: 560891 }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async handle({ pluginId }) {
    const { stats } = await this.fetch({ pluginId })
    return renderDownloadsBadge({ downloads: stats.downloads })
  }
}
