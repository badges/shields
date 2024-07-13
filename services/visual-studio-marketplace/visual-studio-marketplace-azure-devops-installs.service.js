import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import VisualStudioMarketplaceBase from './visual-studio-marketplace-base.js'

const description = `
This badge can show total installs, installs for Azure DevOps Services,
or on-premises installs for Azure DevOps Server.
`

// This service exists separately from the other Marketplace downloads badges (in ./visual-studio-marketplace-downloads.js)
// due differences in how the Marketplace tracks metrics for Azure DevOps extensions vs. other extension types.
// See https://github.com/badges/shields/pull/2748 for more information on the discussion and decision.
export default class VisualStudioMarketplaceAzureDevOpsInstalls extends VisualStudioMarketplaceBase {
  static category = 'downloads'

  static route = {
    base: 'visual-studio-marketplace/azure-devops/installs',
    pattern: ':measure(total|onprem|services)/:extensionId',
  }

  static openApi = {
    '/visual-studio-marketplace/azure-devops/installs/{measure}/{extensionId}':
      {
        get: {
          summary:
            'Visual Studio Marketplace Installs - Azure DevOps Extension',
          description,
          parameters: pathParams(
            {
              name: 'measure',
              example: 'total',
              schema: { type: 'string', enum: this.getEnum('measure') },
            },
            { name: 'extensionId', example: 'swellaby.mirror-git-repository' },
          ),
        },
      },
  }

  static defaultBadgeData = { label: 'installs' }

  transform({ json, measure }) {
    const { statistics } = this.transformStatistics({ json })
    const { onpremDownloads, install } = statistics
    if (measure === 'total') {
      return { downloads: onpremDownloads + install }
    }
    if (measure === 'services') {
      return { downloads: install }
    }
    return { downloads: onpremDownloads }
  }

  async handle({ measure, extensionId }) {
    const json = await this.fetch({ extensionId })
    const { downloads } = this.transform({ json, measure })
    return renderDownloadsBadge({ downloads })
  }
}
