import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { BaseModrinthService, description } from './modrinth-base.js'

export default class ModrinthVersion extends BaseModrinthService {
  static category = 'version'

  static route = {
    base: 'modrinth/v',
    pattern: ':projectId',
  }

  static openApi = {
    '/modrinth/v/{projectId}': {
      get: {
        summary: 'Modrinth Version',
        description,
        parameters: pathParams({
          name: 'projectId',
          example: 'AANobbMI',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'version' }

  async handle({ projectId }) {
    const { 0: latest } = await this.fetchVersions({ projectId })
    const version = latest.version_number
    return renderVersionBadge({ version })
  }
}
