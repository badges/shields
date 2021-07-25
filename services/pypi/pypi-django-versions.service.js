import PypiBase from './pypi-base.js'
import { sortDjangoVersions, parseClassifiers } from './pypi-helpers.js'

export default class PypiDjangoVersions extends PypiBase {
  static category = 'platform-support'

  static route = this.buildRoute('pypi/djversions')

  static examples = [
    {
      title: 'PyPI - Django Version',
      pattern: ':packageName',
      namedParams: { packageName: 'djangorestframework' },
      staticPreview: this.render({ versions: ['1.11', '2.0', '2.1'] }),
      keywords: ['python'],
    },
  ]

  static defaultBadgeData = { label: 'django versions' }

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
