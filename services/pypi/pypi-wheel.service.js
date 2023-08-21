import { pathParams } from '../index.js'
import PypiBase from './pypi-base.js'
import { getPackageFormats } from './pypi-helpers.js'

export default class PypiWheel extends PypiBase {
  static category = 'platform-support'

  static route = this.buildRoute('pypi/wheel')

  static openApi = {
    '/pypi/wheel/{packageName}': {
      get: {
        summary: 'PyPI - Wheel',
        parameters: pathParams({
          name: 'packageName',
          example: 'Django',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'wheel' }

  static render({ hasWheel }) {
    if (hasWheel) {
      return {
        message: 'yes',
        color: 'brightgreen',
      }
    } else {
      return {
        message: 'no',
        color: 'red',
      }
    }
  }

  async handle({ egg }) {
    const packageData = await this.fetch({ egg })
    const { hasWheel } = getPackageFormats(packageData)
    return this.constructor.render({ hasWheel })
  }
}
