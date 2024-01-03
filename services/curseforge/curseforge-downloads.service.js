import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import BaseCurseForgeService, { description } from './curseforge-base.js'

export default class CurseForgeDownloads extends BaseCurseForgeService {
  static category = 'downloads'

  static route = {
    base: 'curseforge/dt',
    pattern: ':projectId',
  }

  static openApi = {
    '/curseforge/dt/{projectId}': {
      get: {
        summary: 'CurseForge Downloads',
        description,
        parameters: pathParams({
          name: 'projectId',
          example: '238222',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ projectId }) {
    const { downloads } = await this.fetchMod({ projectId })
    return renderDownloadsBadge({ downloads })
  }
}
