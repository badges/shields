import { pathParams } from '../index.js'
import { starRating, metric } from '../text-formatters.js'
import { floorCount } from '../color-formatters.js'
import { NotFound } from '../../core/base-service/errors.js'
import { BaseVoxelShopService, description } from './voxelshop-base.js'

export default class VoxelShopRatings extends BaseVoxelShopService {
  static category = 'rating'

  static route = {
    base: 'voxel-shop',
    pattern: ':format(rating|stars)/:resourceId',
  }

  static openApi = {
    '/voxel-shop/{format}/{resourceId}': {
      get: {
        summary: 'Voxel Shop Rating',
        description,
        parameters: pathParams(
          {
            name: 'format',
            example: 'rating',
            schema: { type: 'string', enum: this.getEnum('format') },
          },
          {
            name: 'resourceId',
            example: '323',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'rating',
  }

  static render({ format, total, average }) {
    const message =
      format === 'stars'
        ? starRating(average)
        : `${average}/5 (${metric(total)})`
    return {
      message,
      color: floorCount(average, 2, 3, 4),
    }
  }

  async handle({ format, resourceId }) {
    const { response } = await this.fetch({ resourceId })
    if (!response.resource) {
      throw new NotFound()
    }
    return this.constructor.render({
      format,
      total: response.resource.reviews.count,
      average: response.resource.reviews.stars.toFixed(2),
    })
  }
}
