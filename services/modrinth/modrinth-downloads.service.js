import { renderDownloadsBadge } from '../downloads.js'
import { BaseModrinthService, documentation } from './modrinth-base.js'

export default class ModrinthDownloads extends BaseModrinthService {
  static category = 'downloads'

  static route = {
    base: 'modrinth/dt',
    pattern: ':projectId',
  }

  static examples = [
    {
      title: 'Modrinth Downloads',
      namedParams: { projectId: 'AANobbMI' },
      staticPreview: renderDownloadsBadge({ downloads: 120000 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async handle({ projectId }) {
    const { downloads } = await this.fetchProject({ projectId })
    return renderDownloadsBadge({ downloads })
  }
}
