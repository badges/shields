import { pathParams } from '../index.js'
import PypiBase from './pypi-base.js'
import { getPackageFormats } from './pypi-helpers.js'

export default class PypiFormat extends PypiBase {
  static category = 'other'

  static route = this.buildRoute('pypi/format')

  static openApi = {
    '/pypi/format/{packageName}': {
      get: {
        summary: 'PyPI - Format',
        parameters: pathParams({
          name: 'packageName',
          example: 'Django',
        }),
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

  async handle({ egg }) {
    const packageData = await this.fetch({ egg })
    const { hasWheel, hasEgg } = getPackageFormats(packageData)
    return this.constructor.render({ hasWheel, hasEgg })
  }
}
