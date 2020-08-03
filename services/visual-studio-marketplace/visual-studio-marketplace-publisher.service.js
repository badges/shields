'use strict'

const VisualStudioMarketplaceBase = require('./visual-studio-marketplace-base')

module.exports = class VisualStudioMarketplacePublisher extends VisualStudioMarketplaceBase {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: '',
      pattern:
        '(visual-studio-marketplace|vscode-marketplace)/publisher/:measure(id|name)/:extensionId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Marketplace Publisher ID',
        pattern: 'visual-studio-marketplace/publisher/id/:extensionId',
        namedParams: { extensionId: 'yasht.terminal-all-in-one' },
        staticPreview: this.render({ measure: 'id', publisher: 'yasht' }),
        keywords: this.keywords,
      },
      {
        title: 'Visual Studio Marketplace Publisher Name',
        pattern: 'visual-studio-marketplace/publisher/name/:extensionId',
        namedParams: { extensionId: 'yasht.terminal-all-in-one' },
        staticPreview: this.render({ measure: 'name', publisher: 'Yash T' }),
        keywords: this.keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'publisher',
    }
  }

  static render({ publisher, measure }) {
    const label = measure === 'id' ? 'publisher id' : 'publisher'
    return {
      label,
      message: publisher,
      color: 'brightgreen',
    }
  }

  transform({ json, measure }) {
    const { extension } = this.transformExtension({ json })
    const publisher =
      measure === 'id'
        ? extension.publisher.publisherName
        : extension.publisher.displayName
    return { publisher }
  }

  async handle({ extensionId, measure }) {
    const json = await this.fetch({ extensionId })
    const { publisher } = this.transform({ json, measure })

    return this.constructor.render({ publisher, measure })
  }
}
