'use strict'

const { renderVersionBadge } = require('../../lib/version')
const PypiBase = require('./pypi-base')

module.exports = class PypiVersion extends PypiBase {
  static get category() {
    return 'version'
  }

  static get route() {
    return this.buildRoute('pypi/v')
  }

  static get defaultBadgeData() {
    return { label: 'pypi' }
  }

  static get examples() {
    return [
      {
        title: 'PyPI',
        previewUrl: 'nine',
        keywords: ['python'],
      },
    ]
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ egg }) {
    const {
      info: { version },
    } = await this.fetch({ egg })
    return this.constructor.render({ version })
  }
}
