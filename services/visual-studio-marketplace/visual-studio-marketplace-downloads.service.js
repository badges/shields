import { renderDownloadsBadge } from '../downloads.js'
import VisualStudioMarketplaceBase from './visual-studio-marketplace-base.js'

const documentation = `
<p>
  This is for Visual Studio and Visual Studio Code Extensions.
</p>
<p>
  For correct results on Azure DevOps Extensions, use the Azure DevOps Installs badge instead.
</p>
`

export default class VisualStudioMarketplaceDownloads extends VisualStudioMarketplaceBase {
  static category = 'downloads'

  static route = {
    base: '',
    pattern:
      '(visual-studio-marketplace|vscode-marketplace)/:measure(d|i)/:extensionId',
  }

  static examples = [
    {
      title: 'Visual Studio Marketplace Installs',
      pattern: 'visual-studio-marketplace/i/:extensionId',
      namedParams: { extensionId: 'ritwickdey.LiveServer' },
      staticPreview: this.render({ measure: 'i', downloads: 843 }),
      keywords: this.keywords,
      documentation,
    },
    {
      title: 'Visual Studio Marketplace Downloads',
      pattern: 'visual-studio-marketplace/d/:extensionId',
      namedParams: { extensionId: 'ritwickdey.LiveServer' },
      staticPreview: this.render({ measure: 'd', downloads: 1239 }),
      keywords: this.keywords,
      documentation,
    },
  ]

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
