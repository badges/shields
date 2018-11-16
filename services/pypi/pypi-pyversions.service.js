'use strict'

const PypiBase = require('./pypi-base')
const { parseClassifiers } = require('./pypi-helpers')

module.exports = class PypiPythonVersions extends PypiBase {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return this.buildRoute('pypi/pyversions')
  }

  static get defaultBadgeData() {
    return { label: 'python' }
  }

  static get examples() {
    return [
      {
        title: 'PyPI - Python Version',
        previewUrl: 'Django',
        keywords: ['python'],
      },
    ]
  }

  static render({ versions }) {
    const versionSet = new Set(versions)
    // We only show v2 if eg. v2.4 does not appear.
    // See https://github.com/badges/shields/pull/489 for more.
    ;['2', '3'].forEach(majorVersion => {
      if (Array.from(versions).some(v => v.startsWith(`${majorVersion}.`))) {
        versionSet.delete(majorVersion)
      }
    })
    if (versionSet.size) {
      return {
        message: Array.from(versionSet)
          .sort()
          .join(' | '),
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
      /^Programming Language :: Python :: ([\d.]+)$/
    )

    return this.constructor.render({ versions })
  }
}
