import { pathParams } from '../index.js'
import { NotFound } from '../../core/base-service/errors.js'
import { renderDownloadsBadge } from '../downloads.js'
import { BaseVoxelShopService, description } from './voxelshop-base.js'

export default class VoxelShopDownloads extends BaseVoxelShopService {
  static category = 'downloads'

  static route = {
    base: 'voxel-shop/dt',
    pattern: ':resourceId',
  }

  static openApi = {
    '/voxel-shop/dt/{resourceId}': {
      get: {
        summary: 'Voxel Shop Downloads',
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
