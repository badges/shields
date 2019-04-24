'use strict'

const PypiBase = require('./pypi-base')
const { getPackageFormats } = require('./pypi-helpers')

module.exports = class PypiFormat extends PypiBase {
  static get category() {
    return 'other'
  }

  static get route() {
    return this.buildRoute('pypi/format')
  }

  static get examples() {
    return [
      {
        title: 'PyPI - Format',
        pattern: ':packageName',
        namedParams: { packageName: 'Django' },
        staticPreview: this.render({ hasWheel: true }),
        keywords: ['python'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'format' }
  }

  static render({ hasWheel, hasEgg }) {
    if (hasWheel) {
      return {
        message: 'wheel',
        color: 'brightgreen',
      }
    } else if (hasEgg) {
      return {
        message: 'egg',
        color: 'red',
      }
    } else {
      return {
        message: 'source',
        color: 'yellow',
      }
    }
  }

  async handle({ egg }) {
    const packageData = await this.fetch({ egg })
    const { hasWheel, hasEgg } = getPackageFormats(packageData)
    return this.constructor.render({ hasWheel, hasEgg })
  }
}
