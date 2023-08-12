import { pathParams } from '../index.js'
import { starRating } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { BaseVaadinDirectoryService } from './vaadin-directory-base.js'

export default class VaadinDirectoryRating extends BaseVaadinDirectoryService {
  static category = 'rating'

  static route = {
    base: 'vaadin-directory',
    pattern: ':format(star|stars|rating)/:packageName',
  }

  static openApi = {
    '/vaadin-directory/{format}/{packageName}': {
      get: {
        summary: 'Vaadin Directory Rating',
        parameters: pathParams(
          {
            name: 'format',
            example: 'rating',
            schema: { type: 'string', enum: this.getEnum('format') },
          },
          {
            name: 'packageName',
            example: 'vaadinvaadin-grid',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'rating',
  }

  static render({ format, score }) {
    const rating = (Math.round(score * 10) / 10).toFixed(1)
    if (format === 'rating') {
      return {
        label: 'rating',
        message: `${rating}/5`,
        color: floorCountColor(rating, 2, 3, 4),
      }
    }
    return {
      label: 'stars',
      message: starRating(rating),
      color: floorCountColor(rating, 2, 3, 4),
    }
  }

  async handle({ format, packageName }) {
    const { averageRating } = await this.fetch({ packageName })
    return this.constructor.render({ format, score: averageRating })
  }
}
