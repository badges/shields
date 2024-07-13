import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { BaseModrinthService, description } from './modrinth-base.js'

export default class ModrinthDownloads extends BaseModrinthService {
  static category = 'downloads'

  static route = {
    base: 'modrinth/dt',
    pattern: ':projectId',
  }

  static openApi = {
    '/modrinth/dt/{projectId}': {
      get: {
        summary: 'Modrinth Downloads',
        description,
        parameters: pathParams({
          name: 'projectId',
          example: 'AANobbMI',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ projectId }) {
    const { downloads } = await this.fetchProject({ projectId })
    return renderDownloadsBadge({ downloads })
  }
}
