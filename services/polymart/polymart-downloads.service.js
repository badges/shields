import { pathParams } from '../index.js'
import { NotFound } from '../../core/base-service/errors.js'
import { renderDownloadsBadge } from '../downloads.js'
import { BasePolymartService, description } from './polymart-base.js'

export default class PolymartDownloads extends BasePolymartService {
  static category = 'downloads'

  static route = {
    base: 'polymart/downloads',
    pattern: ':resourceId',
  }

  static openApi = {
    '/polymart/downloads/{resourceId}': {
      get: {
        summary: 'Polymart Downloads',
        description,
        parameters: pathParams({
          name: 'resourceId',
          example: '323',
        }),
      },
    },
  }

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
