'use strict'

const { renderLicenseBadge } = require('../../lib/licenses')
const PypiBase = require('./pypi-base')

module.exports = class PypiLicense extends PypiBase {
  static get category() {
    return 'license'
  }

  static get url() {
    return this.buildUrl('pypi/l')
  }

  static get examples() {
    return [
      {
        title: 'PyPI - License',
        previewUrl: 'Django',
        keywords: ['python'],
      },
    ]
  }

  static render({ license }) {
    return renderLicenseBadge({ license })
  }

  async handle({ egg }) {
    const {
      info: { license },
    } = await this.fetch({ egg })
    return this.constructor.render({ license })
  }
}
