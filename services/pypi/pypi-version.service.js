import { pathParams } from '../index.js'
import { pep440VersionColor } from '../color-formatters.js'
import { renderVersionBadge } from '../version.js'
import PypiBase from './pypi-base.js'

export default class PypiVersion extends PypiBase {
  static category = 'version'

  static route = this.buildRoute('pypi/v')

  static openApi = {
    '/pypi/v/{packageName}': {
      get: {
        summary: 'PyPI - Version',
        parameters: pathParams({
          name: 'packageName',
          example: 'nine',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'pypi' }

  static render({ version }) {
    return renderVersionBadge({ version, versionFormatter: pep440VersionColor })
  }

  async handle({ egg }) {
    const {
      info: { version },
    } = await this.fetch({ egg })
    return this.constructor.render({ version })
  }
}
