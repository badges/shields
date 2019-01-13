'use strict'

const VisualStudioMarketplaceBase = require('./visual-studio-marketplace-base')
const { metric } = require('../../lib/text-formatters')
const { downloadCount } = require('../../lib/color-formatters')

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

  static render({ measure, count }) {
    const label = measure === 'd' ? 'downloads' : 'installs'

    return {
      label,
      message: metric(count),
      color: downloadCount(count),
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
      },
      {
        title: 'Visual Studio Marketplace Downloads',
        pattern: 'visual-studio-marketplace/d/:extensionId',
        namedParams: { extensionId: 'ritwickdey.LiveServer' },
        staticPreview: this.render({ measure: 'd', count: 1239 }),
        keywords: this.keywords,
        documentation: `For Azure DevOps extensions, this includes total downloads for both on-prem Azure DevOps Server and Azure DevOps Services`,
      },
    ]
  }

  transform({ measure, json }) {
    const { statistics } = this.transformStatistics({ json })
    const { value: installs } = this.getStatistic({
      statistics,
      statisticName: 'install',
    })

    if (measure === 'i') {
      return { count: installs }
    }

    let updates
    const { value: updateCount } = this.getStatistic({
      statistics,
      statisticName: 'updateCount',
    })

    // updateCount will only be greater than 0 if the extension is for VS or VS Code.
    // If the value of updateCount is zero then the extension is either:
    // (A) For VS or VS Code, but has no published updates that have been downloaded
    // (B) For Azure DevOps
    // It is not possible to definitively know whether A or B is true, but in either case we should
    // check the value of the onpremDownloads statistic tracked for Azure DevOps extensions.
    // If the extension is for VS or VS Code then onpremDownloads will be 0 so we'll still
    // get the correct number of downloads in all cases.
    if (updateCount > 0) {
      updates = updateCount
    } else {
      const { value: onpremDownloads } = this.getStatistic({
        statistics,
        statisticName: 'onpremDownloads',
      })
      updates = onpremDownloads
    }

    const downloads = +installs + +updates
    return { count: downloads }
  }

  async handle({ measure, extensionId }) {
    const json = await this.fetch({ extensionId })
    const { count } = this.transform({ measure, json })
    return this.constructor.render({ measure, count })
  }
}
