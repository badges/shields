'use strict'

const PypiBase = require('./pypi-base')
const { parseClassifiers } = require('./pypi-helpers')

module.exports = class PypiImplementation extends PypiBase {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return this.buildRoute('pypi/implementation')
  }

  static get examples() {
    return [
      {
        title: 'PyPI - Implementation',
        pattern: ':packageName',
        namedParams: { packageName: 'Django' },
        staticPreview: this.render({ implementations: ['cpython'] }),
        keywords: ['python'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'implementation' }
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
