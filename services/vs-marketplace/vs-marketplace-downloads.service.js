'use strict'

const VsMarketplaceBase = require('./vs-marketplace-base')
const { metric } = require('../../lib/text-formatters')
const { downloadCount } = require('../../lib/color-formatters')

module.exports = class VsMarketplaceDownloads extends VsMarketplaceBase {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: '',
      pattern: '(vscode-marketplace|vs-marketplace)/:measure(d|i)/:extensionId',
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
        pattern: 'vs-marketplace/i/:extensionId',
        namedParams: { extensionId: 'ritwickdey.LiveServer' },
        staticPreview: this.render({ measure: 'i', count: 843 }),
        keywords: this.keywords,
      },
      {
        title: 'Visual Studio Marketplace Downloads',
        pattern: 'vs-marketplace/d/:extensionId',
        namedParams: { extensionId: 'ritwickdey.LiveServer' },
        staticPreview: this.render({ measure: 'd', count: 1239 }),
        keywords: this.keywords,
      },
    ]
  }

  async handle({ measure, extensionId }) {
    const json = await this.fetch({ extensionId })
    const { statistics } = this.transformStatistics({ json })
    const { value: installs } = this.getStatistic({
      statistics,
      statisticName: 'install',
    })

    if (measure === 'i') {
      return this.constructor.render({ measure, count: installs })
    }

    const { value: updates } = this.getStatistic({
      statistics,
      statisticName: 'updateCount',
    })
    const downloads = +installs + +updates
    return this.constructor.render({ measure, count: downloads })
  }
}
