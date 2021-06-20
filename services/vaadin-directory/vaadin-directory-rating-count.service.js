import { metric } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { BaseVaadinDirectoryService } from './vaadin-directory-base.js'

export default class VaadinDirectoryRatingCount extends BaseVaadinDirectoryService {
  static category = 'rating'

  static route = {
    base: 'vaadin-directory',
    pattern: ':alias(rc|rating-count)/:packageName',
  }

  static examples = [
    {
      title: 'Vaadin Directory',
      pattern: 'rating-count/:packageName',
      namedParams: { packageName: 'vaadinvaadin-grid' },
      staticPreview: this.render({ ratingCount: 6 }),
      keywords: ['vaadin-directory', 'rating-count'],
    },
  ]

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
