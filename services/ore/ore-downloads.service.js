import { metric } from '../text-formatters.js'
import { downloadCount } from '../color-formatters.js'
import { BaseOreService, documentation, keywords } from './ore-base.js'

export default class OreDownloads extends BaseOreService {
  static category = 'downloads'

  static route = {
    base: 'ore/dt',
    pattern: ':pluginId',
  }

  static examples = [
    {
      title: 'Ore Downloads',
      namedParams: {
        pluginId: 'nucleus',
      },
      staticPreview: this.render({ downloads: 560891 }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'downloads',
  }

  static render({ downloads }) {
    return {
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async handle({ pluginId }) {
    const {
      stats: { downloads },
    } = await this.fetch({ pluginId })
    return this.constructor.render({ downloads })
  }
}
