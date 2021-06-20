import { metric } from '../text-formatters.js'
import { downloadCount } from '../color-formatters.js'
import { BaseSpigetService, documentation, keywords } from './spiget-base.js'

export default class SpigetDownloads extends BaseSpigetService {
  static category = 'downloads'

  static route = {
    base: 'spiget/downloads',
    pattern: ':resourceId',
  }

  static examples = [
    {
      title: 'Spiget Downloads',
      namedParams: {
        resourceId: '9089',
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

  async handle({ resourceId }) {
    const { downloads } = await this.fetch({ resourceId })
    return this.constructor.render({ downloads })
  }
}
