import BaseCurseForgeService, { documentation } from './curseforge-base.js'

export default class CurseForgeGameVersions extends BaseCurseForgeService {
  static category = 'platform-support'

  static route = {
    base: 'curseforge/game-versions',
    pattern: ':projectId',
  }

  static examples = [
    {
      title: 'CurseForge Game Versions',
      namedParams: {
        projectId: '238222',
      },
      staticPreview: this.render({ versions: ['1.20.0', '1.19.4'] }),
      documentation,
    },
  ]

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
