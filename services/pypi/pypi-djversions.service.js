'use strict'

const PypiBase = require('./pypi-base')
const { sortDjangoVersions, parseClassifiers } = require('./pypi-helpers')

module.exports = class PypiDjangoVersions extends PypiBase {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return this.buildRoute('pypi/djversions')
  }

  static get defaultBadgeData() {
    return { label: 'django versions' }
  }

  static get examples() {
    return [
      {
        title: 'PyPI - Django Version',
        previewUrl: 'djangorestframework',
        keywords: ['python', 'django'],
      },
    ]
  }

  static render({ versions }) {
    if (versions.length > 0) {
      return {
        message: sortDjangoVersions(versions).join(' | '),
        color: 'blue',
      }
    } else {
      return {
        message: 'missing',
        color: 'red',
      }
    }
  }

  async handle({ egg }) {
    const packageData = await this.fetch({ egg })

    const versions = parseClassifiers(
      packageData,
      /^Framework :: Django :: ([\d.]+)$/
    )

    return this.constructor.render({ versions })
  }
}
