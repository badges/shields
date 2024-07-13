import { pathParams } from '../index.js'
import { BaseModrinthService, description } from './modrinth-base.js'

export default class ModrinthGameVersions extends BaseModrinthService {
  static category = 'platform-support'

  static route = {
    base: 'modrinth/game-versions',
    pattern: ':projectId',
  }

  static openApi = {
    '/modrinth/game-versions/{projectId}': {
      get: {
        summary: 'Modrinth Game Versions',
        description,
        parameters: pathParams({
          name: 'projectId',
          example: 'AANobbMI',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'game versions' }

  static render({ versions }) {
    if (versions.length > 5) {
      return {
        message: `${versions[0]} | ${versions[1]} | ... | ${versions[versions.length - 2]} | ${versions[versions.length - 1]}`,
        color: 'blue',
      }
    }
    return {
      message: versions.join(' | '),
      color: 'blue',
    }
  }

  async handle({ projectId }) {
    const { 0: latest } = await this.fetchVersions({ projectId })
    const versions = latest.game_versions
    return this.constructor.render({ versions })
  }
}
