import { renderDownloadsBadge } from '../downloads.js'
import { BaseHangarService, documentation } from './hangar-base.js'

export default class HangarDownloads extends BaseHangarService {
  static category = 'downloads'

  static route = {
    base: 'hangar/dt',
    pattern: ':author/:slug',
  }

  static examples = [
    {
      title: 'Hangar Downloads',
      namedParams: { author: 'GeyserMC', slug: 'Floodgate' },
      // I promise this number is not significant.
      staticPreview: renderDownloadsBadge({ downloads: 4077340254 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async handle({ author, slug }) {
    const project = `${author}/${slug}`
    const { downloads } = (await this.fetchProject({ project })).stats
    return renderDownloadsBadge({ downloads })
  }
}
