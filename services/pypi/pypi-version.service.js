import { pep440VersionColor } from '../color-formatters.js'
import { renderVersionBadge } from '../version.js'
import PypiBase, { pypiGeneralParams } from './pypi-base.js'

export default class PypiVersion extends PypiBase {
  static category = 'version'

  static route = this.buildRoute('pypi/v')

  static openApi = {
    '/pypi/v/{packageName}': {
      get: {
        summary: 'PyPI - Version',
        parameters: pypiGeneralParams,
      },
    },
  }

  static defaultBadgeData = { label: 'pypi' }

  static render({ version }) {
    return renderVersionBadge({ version, versionFormatter: pep440VersionColor })
  }

  async handle({ egg }, { pypiBaseUrl }) {
    const {
      info: { version },
    } = await this.fetch({ egg, pypiBaseUrl })
    return this.constructor.render({ version })
  }
}
