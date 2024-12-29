import PypiBase, { pypiGeneralParams } from './pypi-base.js'

export default class PypiTyping extends PypiBase {
  static category = 'platform-support'

  static route = this.buildRoute('pypi/typing')

  static openApi = {
    '/pypi/typing/{packageName}': {
      get: {
        summary: 'PyPI - Typing',
        description: 'Whether the package provides type information (inline annotations or stub files)',
        parameters: pypiGeneralParams,
      },
    },
  }

  static defaultBadgeData = { label: 'Typing' }

  static render({ isTyped }) {
    if (isTyped) {
      return {
        message: 'typed',
        color: 'brightgreen',
      }
    } else {
      return {
        message: 'no',
        color: 'red',
      }
    }
  }

  async handle({ egg }, { pypiBaseUrl }) {
    const packageData = await this.fetch({ egg, pypiBaseUrl })
    const isTyped = packageData.info.classifiers.includes("Typing :: Typed");
    return this.constructor.render({ isTyped })
  }
}
