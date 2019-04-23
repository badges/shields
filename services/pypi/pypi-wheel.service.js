'use strict'

const PypiBase = require('./pypi-base')
const { getPackageFormats } = require('./pypi-helpers')

module.exports = class PypiWheel extends PypiBase {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return this.buildRoute('pypi/wheel')
  }

  static get examples() {
    return [
      {
        title: 'PyPI - Wheel',
        pattern: ':packageName',
        namedParams: { packageName: 'Django' },
        staticPreview: this.render({ hasWheel: true }),
        keywords: ['python'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'wheel' }
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
