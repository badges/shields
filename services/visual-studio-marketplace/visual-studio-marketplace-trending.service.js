'use strict'

const { floorCount } = require('../color-formatters')
const VisualStudioMarketplaceBase = require('./visual-studio-marketplace-base')

module.exports = class VisualStudioMarketplaceTrending extends VisualStudioMarketplaceBase {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: '',
      pattern:
        '(visual-studio-marketplace|vscode-marketplace)/trending/:measure(daily|weekly|monthly)/:extensionId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Marketplace Trending Daily',
        pattern: 'visual-studio-marketplace/trending/daily/:extensionId',
        namedParams: { extensionId: 'yasht.terminal-all-in-one' },
        staticPreview: this.render({ trending: '2.3811', measure: 'daily' }),
        keywords: this.keywords,
      },
      {
        title: 'Visual Studio Marketplace Trending Weekly',
        pattern: 'visual-studio-marketplace/trending/weekly/:extensionId',
        namedParams: { extensionId: 'yasht.terminal-all-in-one' },
        staticPreview: this.render({ trending: '73.2893', measure: 'weekly' }),
        keywords: this.keywords,
      },
      {
        title: 'Visual Studio Marketplace Trending Monthly',
        pattern: 'visual-studio-marketplace/trending/monthly/:extensionId',
        namedParams: { extensionId: 'yasht.terminal-all-in-one' },
        staticPreview: this.render({ trending: '58.3682', measure: 'monthly' }),
        keywords: this.keywords,
      },
    ]
  }

  static render({ trending, measure }) {
    return {
      label: `trending ${measure}`,
      message: parseFloat(trending).toFixed(2),
      color:
        measure === 'daily'
          ? floorCount(trending, 0.5, 1, 1.5)
          : floorCount(trending, 20, 40, 60),
    }
  }

  transform({ json, measure }) {
    const { statistics } = this.transformStatistics({ json })
    const trending = statistics[`trending${measure}`]
    return { trending }
  }

  async handle({ extensionId, measure }) {
    const json = await this.fetch({ extensionId })
    const { trending } = this.transform({ json, measure })
    return this.constructor.render({ trending, measure })
  }
}
