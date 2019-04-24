'use strict'

const { renderVersionBadge } = require('../version')
const PypiBase = require('./pypi-base')

module.exports = class PypiVersion extends PypiBase {
  static get category() {
    return 'version'
  }

  static get route() {
    return this.buildRoute('pypi/v')
  }

  static get examples() {
    return [
      {
        title: 'PyPI',
        pattern: ':packageName',
        namedParams: { packageName: 'nine' },
        staticPreview: this.render({ version: '1.0.0' }),
        keywords: ['python'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'pypi' }
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
