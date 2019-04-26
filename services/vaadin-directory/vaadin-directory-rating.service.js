'use strict'

const { starRating } = require('../text-formatters')
const { floorCount: floorCountColor } = require('../color-formatters')
const { BaseVaadinDirectoryService } = require('./vaadin-directory-base')

module.exports = class VaadinDirectoryRating extends BaseVaadinDirectoryService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'vaadin-directory',
      pattern: ':which(star|stars|rating)/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Vaadin Directory',
        pattern: ':which(stars|rating)/:packageName',
        namedParams: { which: 'rating', packageName: 'vaadinvaadin-grid' },
        staticPreview: this.render({ which: 'rating', score: 4.75 }),
        keywords: ['vaadin-directory', 'rating'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'rating' }
  }

  static render({ which, score }) {
    const rating = (Math.round(score * 10) / 10).toFixed(1)
    if (which === 'rating') {
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

  async handle({ which, packageName }) {
    const { averageRating } = await this.fetch({ packageName })
    return this.constructor.render({ which, score: averageRating })
  }
}
