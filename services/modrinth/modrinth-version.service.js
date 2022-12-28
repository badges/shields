import { renderVersionBadge } from '../version.js'
import { BaseModrinthService, documentation } from './modrinth-base.js'

export default class ModrinthVersion extends BaseModrinthService {
  static category = 'version'

  static route = {
    base: 'modrinth/v',
    pattern: ':projectId',
  }

  static examples = [
    {
      title: 'Modrinth Version',
      namedParams: { projectId: 'AANobbMI' },
      staticPreview: renderVersionBadge({ version: '0.4.4' }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'version' }

  async handle({ projectId }) {
    const { 0: latest } = await this.fetchVersions({ projectId })
    const version = latest.version_number
    return renderVersionBadge({ version })
  }
}
