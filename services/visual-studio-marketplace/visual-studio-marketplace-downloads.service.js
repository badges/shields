import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import VisualStudioMarketplaceBase from './visual-studio-marketplace-base.js'

const description = `
This is for Visual Studio and Visual Studio Code Extensions.

For correct results on Azure DevOps Extensions, use the Azure DevOps Installs badge instead.
`

export default class VisualStudioMarketplaceDownloads extends VisualStudioMarketplaceBase {
  static category = 'downloads'

  static route = {
    base: '',
    pattern:
      '(visual-studio-marketplace|vscode-marketplace)/:measure(d|i)/:extensionId',
  }

  static openApi = {
    '/visual-studio-marketplace/i/{extensionId}': {
      get: {
        summary: 'Visual Studio Marketplace Installs',
        description,
        parameters: pathParams({
          name: 'extensionId',
          example: 'ritwickdey.LiveServer',
        }),
      },
    },
    '/visual-studio-marketplace/d/{extensionId}': {
      get: {
        summary: 'Visual Studio Marketplace Downloads',
        description,
        parameters: pathParams({
          name: 'extensionId',
          example: 'ritwickdey.LiveServer',
        }),
      },
    },
  }

  static render({ measure, downloads }) {
    const labelOverride = measure === 'd' ? 'downloads' : 'installs'
    return renderDownloadsBadge({ downloads, labelOverride })
  }

  async handle({ measure, extensionId }) {
    const json = await this.fetch({ extensionId })
    const { statistics } = this.transformStatistics({ json })
    const downloads =
      measure === 'i'
        ? statistics.install
        : statistics.install + statistics.updateCount
    return this.constructor.render({ measure, downloads })
  }
}
