import { renderVersionBadge } from '../version.js'
import { BaseOreService, documentation, keywords } from './ore-base.js'

export default class OreVersion extends BaseOreService {
  static category = 'version'

  static route = {
    base: 'ore/v',
    pattern: ':pluginId',
  }

  static examples = [
    {
      title: 'Ore Version',
      namedParams: {
        pluginId: 'nucleus',
      },
      staticPreview: renderVersionBadge({ version: '2.2.3' }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'version',
  }

  static render({ version }) {
    if (!version) {
      return { message: 'none', color: 'inactive' }
    }
    return renderVersionBadge({ version })
  }

  transform({ data }) {
    const { promoted_versions: promotedVersions } = data
    return {
      version:
        promotedVersions.length === 0 ? undefined : promotedVersions[0].version,
    }
  }

  async handle({ pluginId }) {
    const data = await this.fetch({ pluginId })
    const { version } = this.transform({ data })
    return this.constructor.render({ version })
  }
}
