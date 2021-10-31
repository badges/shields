import { renderDownloadsBadge } from '../downloads.js'
import { BaseSpigetService, documentation, keywords } from './spiget-base.js'

export default class SpigetDownloads extends BaseSpigetService {
  static category = 'downloads'

  static route = {
    base: 'spiget/downloads',
    pattern: ':resourceId',
  }

  static examples = [
    {
      title: 'Spiget Downloads',
      namedParams: {
        resourceId: '9089',
      },
      staticPreview: renderDownloadsBadge({ downloads: 560891 }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async handle({ resourceId }) {
    const { downloads } = await this.fetch({ resourceId })
    return renderDownloadsBadge({ downloads })
  }
}
