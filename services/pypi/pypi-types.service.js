import PypiBase, { pypiGeneralParams } from './pypi-base.js'

export default class PypiTyping extends PypiBase {
  static category = 'platform-support'

  static route = this.buildRoute('pypi/types')

  static openApi = {
    '/pypi/types/{packageName}': {
      get: {
        summary: 'PyPI - Types',
        description:
          'Whether the package provides type information, as indicated by the presence of the Typing :: Typed classifier in the package metadata',
        parameters: pypiGeneralParams,
      },
    },
  }

  static defaultBadgeData = { label: 'types' }

  static render({ isTyped }) {
    if (isTyped) {
      return {
        message: 'typed',
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
    return this.constructor.render({ isTyped })
  }
}
