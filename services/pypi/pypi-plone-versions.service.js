import PypiBase from './pypi-base.js'
import { sortDjangoVersions, parseClassifiers } from './pypi-helpers.js'

export default class PypiPloneVersions extends PypiBase {
  static category = 'platform-support'

  static route = this.buildRoute('pypi/ploneversions')

  static examples = [
    {
      title: 'PyPI - Plone Version',
      pattern: ':packageName',
      namedParams: { packageName: 'plone.volto' },
      staticPreview: this.render({ versions: ['5.2', '6.0'] }),
      keywords: ['python'],
    },
  ]

  static defaultBadgeData = { label: 'plone versions' }

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
      /^Framework :: Plone :: ([\d.]+)$/
    )

    return this.constructor.render({ versions })
  }
}
