import PypiBase from './pypi-base.js'
import { parseClassifiers } from './pypi-helpers.js'

export default class PypiStatus extends PypiBase {
  static category = 'other'

  static route = this.buildRoute('pypi/status')

  static examples = [
    {
      title: 'PyPI - Status',
      pattern: ':packageName',
      namedParams: { packageName: 'Django' },
      staticPreview: this.render({ status: 'stable' }),
      keywords: ['python'],
    },
  ]

  static defaultBadgeData = { label: 'status' }

  static render({ status = '' }) {
    status = status.toLowerCase()

    const color = {
      planning: 'red',
      'pre-alpha': 'red',
      alpha: 'red',
      beta: 'yellow',
      stable: 'brightgreen',
      mature: 'brightgreen',
      inactive: 'red',
    }[status]

    return {
      message: status,
      color,
    }
  }

  async handle({ egg }) {
    const packageData = await this.fetch({ egg })

    // Possible statuses:
    // - Development Status :: 1 - Planning
    // - Development Status :: 2 - Pre-Alpha
    // - Development Status :: 3 - Alpha
    // - Development Status :: 4 - Beta
    // - Development Status :: 5 - Production/Stable
    // - Development Status :: 6 - Mature
    // - Development Status :: 7 - Inactive
    // https://pypi.org/pypi?%3Aaction=list_classifiers
    const status = parseClassifiers(
      packageData,
      /^Development Status :: (\d - \S+)$/
    )
      .sort()
      .map(classifier => classifier.split(' - ').pop())
      .map(classifier => classifier.replace(/production\/stable/i, 'stable'))
      .pop()

    return this.constructor.render({ status })
  }
}
