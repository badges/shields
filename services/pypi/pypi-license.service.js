'use strict'

const { renderLicenseBadge } = require('../../lib/licenses')
const PypiBase = require('./pypi-base')
const { getLicenses } = require('./pypi-helpers')

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

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle({ egg }) {
    const packageData = await this.fetch({ egg })
    const licenses = getLicenses(packageData)
    return this.constructor.render({ licenses })
  }
}
