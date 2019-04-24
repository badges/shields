'use strict'

const { renderVersionBadge } = require('../version')
const VisualStudioMarketplaceBase = require('./visual-studio-marketplace-base')

module.exports = class VisualStudioMarketplaceVersion extends VisualStudioMarketplaceBase {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: '',
      pattern: '(visual-studio-marketplace|vscode-marketplace)/v/:extensionId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Marketplace Version',
        pattern: 'visual-studio-marketplace/v/:extensionId',
        namedParams: { extensionId: 'swellaby.rust-pack' },
        staticPreview: this.render({ version: '0.2.7' }),
        keywords: this.keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'version',
    }
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  transform({ json }) {
    const { extension } = this.transformExtension({ json })
    const version = extension.versions[0].version
    return { version }
  }

  async handle({ extensionId }) {
    const json = await this.fetch({ extensionId })
    const { version } = this.transform({ json })

    return this.constructor.render({ version })
  }
}
