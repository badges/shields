'use strict'

const PypiBase = require('./pypi-base')
const { getPackageFormats } = require('./pypi-helpers')

module.exports = class PypiWheel extends PypiBase {
  static get category() {
    return 'other'
  }

  static get route() {
    return this.buildRoute('pypi/wheel')
  }

  static get defaultBadgeData() {
    return { label: 'wheel' }
  }

  static get examples() {
    return [
      {
        title: 'PyPI - Wheel',
        previewUrl: 'Django',
        keywords: ['python'],
      },
    ]
  }

  static render({ hasWheel }) {
    if (hasWheel) {
      return {
        message: 'yes',
        color: 'brightgreen',
      }
    } else {
      return {
        message: 'no',
        color: 'red',
      }
    }
  }

  async handle({ egg }) {
    const packageData = await this.fetch({ egg })
    const { hasWheel } = getPackageFormats(packageData)
    return this.constructor.render({ hasWheel })
  }
}
