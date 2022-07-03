import { renderDownloadsBadge } from '../downloads.js'
import { BasePolymartService, documentation } from './polymart-base.js'

export default class PolymartDownloads extends BasePolymartService {
  static category = 'downloads'

  static route = {
    base: 'polymart/downloads',
    pattern: ':resourceId',
  }

  static examples = [
    {
      title: 'Polymart Downloads',
      namedParams: {
        resourceId: '1620',
      },
      staticPreview: renderDownloadsBadge({ downloads: 74 }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'downloads',
    color: 'green',
  }

  async handle({ resourceId }) {
    const { response } = await this.fetch({ resourceId })
    return renderDownloadsBadge({ downloads: response.resource.downloads })
  }
}
