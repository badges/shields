import { pathParams } from '../index.js'
import { renderDateBadge } from '../date.js'
import VisualStudioMarketplaceBase from './visual-studio-marketplace-base.js'

export default class VisualStudioMarketplaceLastUpdated extends VisualStudioMarketplaceBase {
  static category = 'activity'

  static route = {
    base: '',
    pattern:
      '(visual-studio-marketplace|vscode-marketplace)/last-updated/:extensionId',
  }

  static openApi = {
    '/visual-studio-marketplace/last-updated/{extensionId}': {
      get: {
        summary: 'Visual Studio Marketplace Last Updated',
        parameters: pathParams({
          name: 'extensionId',
          example: 'yasht.terminal-all-in-one',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'last updated',
  }

  transform({ json }) {
    const { extension } = this.transformExtension({ json })
    const lastUpdated = extension.lastUpdated
    return { lastUpdated }
  }

  async handle({ extensionId }) {
    const json = await this.fetch({ extensionId })
    const { lastUpdated } = this.transform({ json })
    return renderDateBadge(lastUpdated)
  }
}
