import { pathParams } from '../index.js'
import { NotFound } from '../../core/base-service/errors.js'
import { renderVersionBadge } from '../version.js'
import { BaseVoxelShopService, description } from './voxelshop-base.js'

export default class VoxelShopLatestVersion extends BaseVoxelShopService {
  static category = 'version'

  static route = {
    base: 'voxel-shop/version',
    pattern: ':resourceId',
  }

  static openApi = {
    '/voxel-shop/version/{resourceId}': {
      get: {
        summary: 'Voxel Shop Version',
        description,
        parameters: pathParams({
          name: 'resourceId',
          example: '323',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'voxel.shop',
  }

  async handle({ resourceId }) {
    const { response } = await this.fetch({ resourceId })
    if (!response.resource) {
      throw new NotFound()
    }
    return renderVersionBadge({
      version: response.resource.updates.latest.version,
    })
  }
}
