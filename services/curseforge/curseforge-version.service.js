import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import BaseCurseForgeService, { description } from './curseforge-base.js'

export default class CurseForgeVersion extends BaseCurseForgeService {
  static category = 'version'

  static route = {
    base: 'curseforge/v',
    pattern: ':projectId',
  }

  static openApi = {
    '/curseforge/v/{projectId}': {
      get: {
        summary: 'CurseForge Version',
        description,
        parameters: pathParams({
          name: 'projectId',
          example: '238222',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'version' }

  async handle({ projectId }) {
    const { version } = await this.fetchMod({ projectId })
    return renderVersionBadge({ version })
  }
}
