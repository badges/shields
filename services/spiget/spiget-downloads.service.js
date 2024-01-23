import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { BaseSpigetService, description } from './spiget-base.js'

export default class SpigetDownloads extends BaseSpigetService {
  static category = 'downloads'

  static route = {
    base: 'spiget/downloads',
    pattern: ':resourceId',
  }

  static openApi = {
    '/spiget/downloads/{resourceId}': {
      get: {
        summary: 'Spiget Downloads',
        description,
        parameters: pathParams({
          name: 'resourceId',
          example: '9089',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ resourceId }) {
    const { downloads } = await this.fetch({ resourceId })
    return renderDownloadsBadge({ downloads })
  }
}
