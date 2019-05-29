'use strict'

const { renderVersionBadge } = require('../version')
const { BaseVaadinDirectoryService } = require('./vaadin-directory-base')

module.exports = class VaadinDirectoryVersion extends BaseVaadinDirectoryService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'vaadin-directory',
      pattern: ':alias(v|version)/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Vaadin Directory',
        pattern: 'v/:packageName',
        namedParams: { packageName: 'vaadinvaadin-grid' },
        staticPreview: renderVersionBadge({ version: 'v5.3.0-alpha4' }),
        keywords: ['vaadin-directory', 'version', 'latest version'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'vaadin directory' }
  }

  async handle({ alias, packageName }) {
    const data = await this.fetch({ packageName })
    const lv = data.latestAvailableRelease.name.toLowerCase()
    return renderVersionBadge({ version: lv })
  }
}
