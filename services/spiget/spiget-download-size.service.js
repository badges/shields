import { pathParams } from '../index.js'
import { BaseSpigetService, description } from './spiget-base.js'

export default class SpigetDownloadSize extends BaseSpigetService {
  static category = 'size'

  static route = {
    base: 'spiget/download-size',
    pattern: ':resourceId',
  }

  static openApi = {
    '/spiget/download-size/{resourceId}': {
      get: {
        summary: 'Spiget Download Size',
        description,
        parameters: pathParams({
          name: 'resourceId',
          example: '15904',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'size',
    color: 'blue',
  }

  static render({ size, unit, type }) {
    if (type === 'external') {
      return {
        message: 'resource hosted externally',
        color: 'lightgrey',
      }
    }
    return {
      message: `${size} ${unit}`,
    }
  }

  async handle({ resourceId }) {
    const { file } = await this.fetch({ resourceId })
    return this.constructor.render({
      size: file.size,
      unit: file.sizeUnit,
      type: file.type,
    })
  }
}
