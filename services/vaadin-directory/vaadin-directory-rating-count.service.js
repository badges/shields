'use strict'

const { metric } = require('../text-formatters')
const { floorCount: floorCountColor } = require('../color-formatters')
const { BaseVaadinDirectoryService } = require('./vaadin-directory-base')

module.exports = class VaadinDirectoryRatingCount extends BaseVaadinDirectoryService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'vaadin-directory',
      pattern: ':alias(rc|rating-count)/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Vaadin Directory',
        pattern: 'rating-count/:packageName',
        namedParams: { packageName: 'vaadinvaadin-grid' },
        staticPreview: this.render({ ratingCount: 6 }),
        keywords: ['vaadin-directory', 'rating-count', 'rating count'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'rating count' }
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
