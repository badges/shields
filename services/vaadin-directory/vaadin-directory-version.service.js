'use strict'

const { BaseVaadinDirectoryService } = require('./vaadin-directory-base')

module.exports = class VaadinDirectoryVersion extends BaseVaadinDirectoryService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'vaadin-directory',
      pattern: ':which(v|version)/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Vaadin Directory',
        pattern: 'v/:packageName',
        namedParams: { packageName: 'vaadinvaadin-grid' },
        staticPreview: this.render({ version: 'v5.3.0-alpha4' }),
        keywords: ['vaadin-directory', 'version', 'latest version'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'vaadin directory' }
  }

  static render({ version }) {
    return { message: version, color: '#00b4f0' }
  }

  async handle({ which, packageName }) {
    const data = await this.fetch({ packageName })
    const lv = data.latestAvailableRelease.name.toLowerCase()
    return this.constructor.render({ version: lv })
  }
}
