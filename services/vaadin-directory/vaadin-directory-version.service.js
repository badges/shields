'use strict'

const { renderVersionBadge } = require('../version')
const { BaseVaadinDirectoryService } = require('./vaadin-directory-base')

module.exports = class VaadinDirectoryVersion extends (
  BaseVaadinDirectoryService
) {
  static category = 'version'

  static route = {
    base: 'vaadin-directory',
    pattern: ':alias(v|version)/:packageName',
  }

  static examples = [
    {
      title: 'Vaadin Directory',
      pattern: 'v/:packageName',
      namedParams: { packageName: 'vaadinvaadin-grid' },
      staticPreview: renderVersionBadge({ version: 'v5.3.0-alpha4' }),
      keywords: ['vaadin-directory', 'latest'],
    },
  ]

  static defaultBadgeData = {
    label: 'vaadin directory',
  }

  async handle({ alias, packageName }) {
    const data = await this.fetch({ packageName })
    const lv = data.latestAvailableRelease.name.toLowerCase()
    return renderVersionBadge({ version: lv })
  }
}
