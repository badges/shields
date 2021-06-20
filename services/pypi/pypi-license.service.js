import { renderLicenseBadge } from '../licenses.js'
import PypiBase from './pypi-base.js'
import { getLicenses } from './pypi-helpers.js'

export default class PypiLicense extends PypiBase {
  static category = 'license'

  static route = this.buildRoute('pypi/l')

  static examples = [
    {
      title: 'PyPI - License',
      pattern: ':packageName',
      namedParams: { packageName: 'Django' },
      staticPreview: this.render({ licenses: ['BSD'] }),
      keywords: ['python'],
    },
  ]

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle({ egg }) {
    const packageData = await this.fetch({ egg })
    const licenses = getLicenses(packageData)
    return this.constructor.render({ licenses })
  }
}
