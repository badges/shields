import { renderVersionBadge } from '../version.js'
import BaseCurseForgeService, { documentation } from './curseforge-base.js'

export default class CurseForgeVersion extends BaseCurseForgeService {
  static category = 'version'

  static route = {
    base: 'curseforge/v',
    pattern: ':projectId',
  }

  static examples = [
    {
      title: 'CurseForge Version',
      namedParams: {
        projectId: '238222',
      },
      staticPreview: renderVersionBadge({
        version: 'jei-1.20-forge-14.0.0.4.jar',
      }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'version' }

  async handle({ projectId }) {
    const { version } = await this.fetchMod({ projectId })
    return renderVersionBadge({ version })
  }
}
