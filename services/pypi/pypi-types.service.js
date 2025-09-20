import PypiBase, { pypiGeneralParams } from './pypi-base.js'

export default class PypiTypes extends PypiBase {
  static category = 'platform-support'

  static route = this.buildRoute('pypi/types')

  static openApi = {
    '/pypi/types/{packageName}': {
      get: {
        summary: 'PyPI - Types',
        description:
          'Type information provided by the package, as indicated by the presence of the `Typing :: Typed` and `Typing :: Stubs Only` classifiers in the package metadata',
        parameters: pypiGeneralParams,
      },
    },
  }

  static defaultBadgeData = { label: 'types' }

  static render({ isTyped, isStubsOnly }) {
    if (isTyped) {
      return {
        message: 'typed',
        color: 'brightgreen',
      }
    } else if (isStubsOnly) {
      return {
        message: 'stubs',
        color: 'brightgreen',
      }
    } else {
      return {
        message: 'untyped',
        color: 'red',
      }
    }
  }

  async handle({ egg }, { pypiBaseUrl }) {
    const packageData = await this.fetch({ egg, pypiBaseUrl })
    const isTyped = packageData.info.classifiers.includes('Typing :: Typed')
    const isStubsOnly = packageData.info.classifiers.includes(
      'Typing :: Stubs Only',
    )
    return this.constructor.render({ isTyped, isStubsOnly })
  }
}
