import { renderLicenseBadge } from '../licenses.js'
import PypiBase, { pypiGeneralParams } from './pypi-base.js'
import { getLicenses } from './pypi-helpers.js'

export default class PypiLicense extends PypiBase {
  static category = 'license'

  static route = this.buildRoute('pypi/l')

  static openApi = {
    '/pypi/l/{packageName}': {
      get: {
        summary: 'PyPI - License',
        parameters: pypiGeneralParams,
      },
    },
  }

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle({ egg }, { pypiBaseUrl }) {
    const packageData = await this.fetch({ egg, pypiBaseUrl })
    const licenses = getLicenses(packageData)
    return this.constructor.render({ licenses })
  }
}
