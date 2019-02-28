'use strict'

const { renderLicenseBadge } = require('../licenses')
const PypiBase = require('./pypi-base')
const { getLicenses } = require('./pypi-helpers')

module.exports = class PypiLicense extends PypiBase {
  static get category() {
    return 'license'
  }

  static get route() {
    return this.buildRoute('pypi/l')
  }

  static get examples() {
    return [
      {
        title: 'PyPI - License',
        pattern: ':packageName',
        namedParams: { packageName: 'Django' },
        staticPreview: this.render({ licenses: ['BSD'] }),
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
