'use strict'

const VsMarketplaceBase = require('./vs-marketplace-base')
const { renderVersionBadge } = require('../../lib/version')

module.exports = class VsMarketplaceVersion extends VsMarketplaceBase {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: '',
      pattern: '(vscode-marketplace|vs-marketplace)/v/:extensionId',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'version',
    }
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Marketplace Version',
        pattern: 'vs-marketplace/v/:extensionId',
        namedParams: { extensionId: 'swellaby.rust-pack' },
        staticPreview: this.render({ version: '0.2.7' }),
        keywords: this.keywords,
      },
    ]
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
