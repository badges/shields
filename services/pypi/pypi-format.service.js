import PypiBase, { pypiGeneralParams } from './pypi-base.js'
import { getPackageFormats } from './pypi-helpers.js'

export default class PypiFormat extends PypiBase {
  static category = 'other'

  static route = this.buildRoute('pypi/format')

  static openApi = {
    '/pypi/format/{packageName}': {
      get: {
        summary: 'PyPI - Format',
        parameters: pypiGeneralParams,
      },
    },
  }

  static defaultBadgeData = { label: 'format' }

  static render({ hasWheel, hasEgg }) {
    if (hasWheel) {
      return {
        message: 'wheel',
        color: 'brightgreen',
      }
    } else if (hasEgg) {
      return {
        message: 'egg',
        color: 'red',
      }
    } else {
      return {
        message: 'source',
        color: 'yellow',
      }
    }
  }

  async handle({ egg }, { pypiBaseUrl }) {
    const packageData = await this.fetch({ egg, pypiBaseUrl })
    const { hasWheel, hasEgg } = getPackageFormats(packageData)
    return this.constructor.render({ hasWheel, hasEgg })
  }
}
