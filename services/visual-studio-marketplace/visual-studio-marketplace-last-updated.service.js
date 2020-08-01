'use strict'

const { age } = require('../color-formatters')
const { formatDate } = require('../text-formatters')
const VisualStudioMarketplaceBase = require('./visual-studio-marketplace-base')

module.exports = class VisualStudioMarketplaceLastUpdated extends VisualStudioMarketplaceBase {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: '',
      pattern:
        '(visual-studio-marketplace|vscode-marketplace)/last-updated/:extensionId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Marketplace Last Updated',
        pattern: 'visual-studio-marketplace/last-updated/:extensionId',
        namedParams: { extensionId: 'yasht.terminal-all-in-one' },
        staticPreview: this.render({ lastUpdated: '2019-04-13T07:50:27.000Z' }),
        keywords: this.keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'last updated',
    }
  }

  static render({ lastUpdated }) {
    return {
      message: formatDate(lastUpdated),
      color: age(lastUpdated),
    }
  }

  transform({ json }) {
    const { extension } = this.transformExtension({ json })
    const lastUpdated = extension.lastUpdated
    return { lastUpdated }
  }

  async handle({ extensionId }) {
    const json = await this.fetch({ extensionId })
    const { lastUpdated } = this.transform({ json })
    return this.constructor.render({ lastUpdated })
  }
}
