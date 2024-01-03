import { pathParams } from '../index.js'
import BaseCurseForgeService, { description } from './curseforge-base.js'

export default class CurseForgeGameVersions extends BaseCurseForgeService {
  static category = 'platform-support'

  static route = {
    base: 'curseforge/game-versions',
    pattern: ':projectId',
  }

  static openApi = {
    '/curseforge/game-versions/{projectId}': {
      get: {
        summary: 'CurseForge Game Versions',
        description,
        parameters: pathParams({
          name: 'projectId',
          example: '238222',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'game versions' }

  static render({ versions }) {
    return {
      message: versions.join(' | '),
      color: 'blue',
    }
  }

  async handle({ projectId }) {
    const { gameVersions } = await this.fetchMod({ projectId })
    const versions = gameVersions
    return this.constructor.render({ versions })
  }
}
