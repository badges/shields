'use strict'

const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const VisualStudioMarketplaceBase = require('./visual-studio-marketplace-base')

const documentation = `
<p>
  This is for Visual Studio and Visual Studio Code Extensions.
</p>
<p>
  For correct results on Azure DevOps Extensions, use the Azure DevOps Installs badge instead.
</p>
`

module.exports = class VisualStudioMarketplaceDownloads extends VisualStudioMarketplaceBase {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: '',
      pattern:
        '(visual-studio-marketplace|vscode-marketplace)/:measure(d|i)/:extensionId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Marketplace Installs',
        pattern: 'visual-studio-marketplace/i/:extensionId',
        namedParams: { extensionId: 'ritwickdey.LiveServer' },
        staticPreview: this.render({ measure: 'i', count: 843 }),
        keywords: this.keywords,
        documentation,
      },
      {
        title: 'Visual Studio Marketplace Downloads',
        pattern: 'visual-studio-marketplace/d/:extensionId',
        namedParams: { extensionId: 'ritwickdey.LiveServer' },
        staticPreview: this.render({ measure: 'd', count: 1239 }),
        keywords: this.keywords,
        documentation,
      },
    ]
  }

  static render({ measure, count }) {
    const label = measure === 'd' ? 'downloads' : 'installs'

    return {
      label,
      message: metric(count),
      color: downloadCount(count),
    }
  }

  async handle({ measure, extensionId }) {
    const json = await this.fetch({ extensionId })
    const { statistics } = this.transformStatistics({ json })
    const count =
      measure === 'i'
        ? statistics.install
        : statistics.install + statistics.updateCount
    return this.constructor.render({ measure, count })
  }
}
