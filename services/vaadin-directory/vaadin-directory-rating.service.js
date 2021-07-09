import { starRating } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { BaseVaadinDirectoryService } from './vaadin-directory-base.js'

export default class VaadinDirectoryRating extends BaseVaadinDirectoryService {
  static category = 'rating'

  static route = {
    base: 'vaadin-directory',
    pattern: ':format(star|stars|rating)/:packageName',
  }

  static examples = [
    {
      title: 'Vaadin Directory',
      pattern: ':format(stars|rating)/:packageName',
      namedParams: { format: 'rating', packageName: 'vaadinvaadin-grid' },
      staticPreview: this.render({ format: 'rating', score: 4.75 }),
      keywords: ['vaadin-directory'],
    },
  ]

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
