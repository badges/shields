'use strict'

const { BaseVaadinDirectoryService } = require('./vaadin-directory-base')

module.exports = class VaadinDirectoryStatus extends BaseVaadinDirectoryService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'vaadin-directory/status',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Vaadin Directory',
        namedParams: { packageName: 'vaadinvaadin-grid' },
        staticPreview: this.render({ status: 'published' }),
        keywords: ['vaadin-directory', 'status'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'vaadin directory' }
  }

  static render({ status }) {
    if (status.toLowerCase() === 'published') {
      return { message: 'published', color: '#00b4f0' }
    }
    return { message: 'unpublished' }
  }

  async handle({ packageName }) {
    const { status } = await this.fetch({ packageName })
    return this.constructor.render({ status })
  }
}
