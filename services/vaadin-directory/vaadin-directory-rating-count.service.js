'use strict'

const { metric } = require('../text-formatters')
const { floorCount: floorCountColor } = require('../color-formatters')
const { BaseVaadinDirectoryService } = require('./vaadin-directory-base')

module.exports = class VaadinDirectoryRatingCount extends (
  BaseVaadinDirectoryService
) {
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
