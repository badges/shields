import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { BaseOreService, description } from './ore-base.js'

export default class OreVersion extends BaseOreService {
  static category = 'version'

  static route = {
    base: 'ore/v',
    pattern: ':pluginId',
  }

  static openApi = {
    '/ore/v/{pluginId}': {
      get: {
        summary: 'Ore Version',
        description,
        parameters: pathParams({
          name: 'pluginId',
          example: 'nucleus',
        }),
      },
    },
  }

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
