'use strict'

const PypiBase = require('./pypi-base')
const { sortDjangoVersions, parseClassifiers } = require('./pypi-helpers')

module.exports = class PypiDjangoVersions extends PypiBase {
  static get category() {
    return 'version'
  }

  static get url() {
    return this.buildUrl('pypi/djversions')
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
    if (versions.size) {
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
