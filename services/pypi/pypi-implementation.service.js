'use strict'

const PypiBase = require('./pypi-base')
const { parseClassifiers } = require('./pypi-helpers')

module.exports = class PypiImplementation extends PypiBase {
  static get category() {
    return 'other'
  }

  static get url() {
    return this.buildUrl('pypi/implementation')
  }

  static get defaultBadgeData() {
    return { label: 'implementation' }
  }

  static get examples() {
    return [
      {
        title: 'PyPI - Implementation',
        previewUrl: 'Django',
        keywords: ['python'],
      },
    ]
  }

  static render({ implementations }) {
    return {
      message: implementations.sort().join(' | '),
      color: 'blue',
    }
  }

  async handle({ egg }) {
    const packageData = await this.fetch({ egg })

    let implementations = parseClassifiers(
      packageData,
      /^Programming Language :: Python :: Implementation :: (\S+)$/
    )
    if (implementations.length === 0) {
      // Assume CPython.
      implementations = ['cpython']
    }

    return this.constructor.render({ implementations })
  }
}
