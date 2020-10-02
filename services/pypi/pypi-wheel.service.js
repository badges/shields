'use strict'

const PypiBase = require('./pypi-base')
const { getPackageFormats } = require('./pypi-helpers')

module.exports = class PypiWheel extends PypiBase {
  static category = 'platform-support'

  static route = this.buildRoute('pypi/wheel')

  static examples = [
    {
      title: 'PyPI - Wheel',
      pattern: ':packageName',
      namedParams: { packageName: 'Django' },
      staticPreview: this.render({ hasWheel: true }),
      keywords: ['python'],
    },
  ]

  static defaultBadgeData = { label: 'wheel' }

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
