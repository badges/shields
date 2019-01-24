'use strict'

const VisualStudioMarketplaceBase = require('./visual-studio-marketplace-base')
const { metric } = require('../../lib/text-formatters')
const { downloadCount } = require('../../lib/color-formatters')

// This service exists separately from the other Marketplace downloads badges (in ./visual-studio-marketplace-downloads.js)
// due differences in how the Marketplace tracks metrics for Azure DevOps extensions vs. other extension types.
// See https://github.com/badges/shields/pull/2748 for more information on the discussion and decision.
module.exports = class VisualStudioMarketplaceAzureDevOpsInstalls extends VisualStudioMarketplaceBase {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'visual-studio-marketplace/azure-devops/installs',
      pattern: ':measure(total|onprem|services)/:extensionId',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'installs',
    }
  }

  static render({ count }) {
    return {
      message: metric(count),
      color: downloadCount(count),
    }
  }

  static get examples() {
    return [
      {
        title:
          'Visual Studio Marketplace - Azure DevOps Extension (Total Installs)',
        pattern: 'total/:extensionId',
        namedParams: { extensionId: 'swellaby.mirror-git-repository' },
        staticPreview: this.render({ count: 651 }),
        keywords: this.keywords,
      },
      {
        title:
          'Visual Studio Marketplace - Azure DevOps Extension (Services Installs)',
        pattern: 'services/:extensionId',
        namedParams: { extensionId: 'swellaby.mirror-git-repository' },
        staticPreview: this.render({ count: 496 }),
        keywords: this.keywords,
      },

      {
        title:
          'Visual Studio Marketplace - Azure DevOps Extension (OnPrem Installs)',
        pattern: 'onprem/:extensionId',
        namedParams: { extensionId: 'swellaby.mirror-git-repository' },
        staticPreview: this.render({ count: 155 }),
        keywords: this.keywords,
      },
    ]
  }

  async handle({ measure, extensionId }) {
    const json = await this.fetch({ extensionId })
    const { statistics } = this.transformStatistics({ json })

    if (measure === 'total') {
      return this.constructor.render({
        count: statistics.onpremDownloads + statistics.install,
      })
    } else if (measure === 'services') {
      return this.constructor.render({ count: statistics.install })
    } else {
      return this.constructor.render({ count: statistics.onpremDownloads })
    }
  }
}
