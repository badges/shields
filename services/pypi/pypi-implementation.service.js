import PypiBase from './pypi-base.js'
import { parseClassifiers } from './pypi-helpers.js'

export default class PypiImplementation extends PypiBase {
  static category = 'platform-support'

  static route = this.buildRoute('pypi/implementation')

  static examples = [
    {
      title: 'PyPI - Implementation',
      pattern: ':packageName',
      namedParams: { packageName: 'Django' },
      staticPreview: this.render({ implementations: ['cpython'] }),
      keywords: ['python'],
    },
  ]

  static defaultBadgeData = { label: 'implementation' }

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
