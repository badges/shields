import { renderDownloadsBadge } from '../downloads.js'
import { BaseHangarService, documentation, keywords } from './hangar-base.js'

export default class HangarDownloads extends BaseHangarService {
  static category = 'downloads'

  static route = {
    base: 'hangar/downloads',
    pattern: ':author/:slug',
  }

  static examples = [
    {
      title: 'Hangar Downloads',
      namedParams: {
        author: 'EssentialsX',
        slug: 'Essentials',
      },
      staticPreview: renderDownloadsBadge({ downloads: 560891 }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async handle({ author, slug }) {
    const { stats } = await this.fetch({ author, slug })
    const { downloads } = stats
    return renderDownloadsBadge({ downloads })
  }
}
