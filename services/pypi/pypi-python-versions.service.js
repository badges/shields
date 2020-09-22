'use strict'

const PypiBase = require('./pypi-base')
const {
  getPythonVersionsFromClassifiers,
  getPythonVersionsFromPythonRequires,
} = require('./pypi-helpers')

module.exports = class PypiPythonVersions extends PypiBase {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return this.buildRoute('pypi/pyversions')
  }

  static get examples() {
    return [
      {
        title: 'PyPI - Python Version',
        pattern: ':packageName',
        namedParams: { packageName: 'Django' },
        staticPreview: this.render({ versions: ['3.5', '3.6', '3.7', '3.8'] }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'python' }
  }

  static render({ versions }) {
    if (versions.length) {
      return {
        message: versions.join(' | '),
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

    const versions =
      getPythonVersionsFromClassifiers(packageData) ||
      getPythonVersionsFromPythonRequires(packageData) ||
      []

    return this.constructor.render({ versions })
  }
}
