import { BaseModrinthService, documentation } from './modrinth-base.js'

export default class ModrinthGameVersions extends BaseModrinthService {
  static category = 'platform-support'

  static route = {
    base: 'modrinth/game-versions',
    pattern: ':projectId',
  }

  static examples = [
    {
      title: 'Modrinth Game Versions',
      namedParams: { projectId: 'AANobbMI' },
      staticPreview: this.render({ versions: ['1.19.2', '1.19.1', '1.19'] }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'game versions' }

  static render({ versions }) {
    if (versions.length) {
      return {
        message: versions.join(' | '),
        color: 'blue',
      }
    } else {
      return {
        message: 'missing',
        color: 'red',
      }
    }
  }

  async handle({ projectId }) {
    const { 0: latest } = await this.fetchVersions({ projectId })
    const versions = latest.game_versions
    return this.constructor.render({ versions })
  }
}
