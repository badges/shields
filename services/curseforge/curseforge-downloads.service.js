import { renderDownloadsBadge } from '../downloads.js'
import BaseCurseForgeService, { documentation } from './curseforge-base.js'

export default class CurseForgeDownloads extends BaseCurseForgeService {
  static category = 'downloads'

  static route = {
    base: 'curseforge/dt',
    pattern: ':projectId',
  }

  static examples = [
    {
      title: 'CurseForge Downloads',
      namedParams: {
        projectId: '238222',
      },
      staticPreview: renderDownloadsBadge({ downloads: 234000000 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async handle({ projectId }) {
    const { downloads } = await this.fetchMod({ projectId })
    return renderDownloadsBadge({ downloads })
  }
}
