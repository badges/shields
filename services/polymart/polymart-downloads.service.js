import { NotFound } from '../../core/base-service/errors.js'
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
        resourceId: '323',
      },
      staticPreview: renderDownloadsBadge({ downloads: 655 }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'downloads',
  }

  async handle({ resourceId }) {
    const { response } = await this.fetch({ resourceId })
    if (!response.resource) {
      throw new NotFound()
    }
    return renderDownloadsBadge({ downloads: response.resource.downloads })
  }
}
