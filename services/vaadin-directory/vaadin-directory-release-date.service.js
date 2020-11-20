'use strict'

const { formatDate } = require('../text-formatters')
const { age: ageColor } = require('../color-formatters')
const { BaseVaadinDirectoryService } = require('./vaadin-directory-base')

module.exports = class VaadinDirectoryReleaseDate extends (
  BaseVaadinDirectoryService
) {
  static category = 'activity'

  static route = {
    base: 'vaadin-directory',
    pattern: ':alias(rd|release-date)/:packageName',
  }

  static examples = [
    {
      title: 'Vaadin Directory',
      pattern: 'release-date/:packageName',
      namedParams: { packageName: 'vaadinvaadin-grid' },
      staticPreview: this.render({ date: '2018-12-12' }),
      keywords: ['vaadin-directory', 'date', 'latest release date'],
    },
  ]

  static defaultBadgeData = {
    label: 'latest release date',
  }

  static render({ date }) {
    return { message: formatDate(date), color: ageColor(date) }
  }

  async handle({ alias, packageName }) {
    const data = await this.fetch({ packageName })
    return this.constructor.render({
      date: data.latestAvailableRelease.publicationDate,
    })
  }
}
