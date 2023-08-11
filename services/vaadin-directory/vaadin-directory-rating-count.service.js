import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { BaseVaadinDirectoryService } from './vaadin-directory-base.js'

export default class VaadinDirectoryRatingCount extends BaseVaadinDirectoryService {
  static category = 'rating'

  static route = {
    base: 'vaadin-directory',
    pattern: ':alias(rc|rating-count)/:packageName',
  }

  static openApi = {
    '/vaadin-directory/rating-count/{packageName}': {
      get: {
        summary: 'Vaadin Directory Rating Count',
        parameters: pathParams({
          name: 'packageName',
          example: 'vaadinvaadin-grid',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'rating count',
  }

  static render({ ratingCount }) {
    return {
      message: `${metric(ratingCount)} total`,
      color: floorCountColor(ratingCount, 5, 50, 500),
    }
  }

  async handle({ alias, packageName }) {
    const { ratingCount } = await this.fetch({ packageName })
    return this.constructor.render({ ratingCount })
  }
}
