'use strict'

const { age } = require('../color-formatters')
const { formatDate } = require('../text-formatters')
const VisualStudioMarketplaceBase = require('./visual-studio-marketplace-base')

module.exports = class VisualStudioMarketplaceReleaseDate extends VisualStudioMarketplaceBase {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: '',
      pattern:
        '(visual-studio-marketplace|vscode-marketplace)/release-date/:extensionId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Marketplace Release Date',
        pattern: 'visual-studio-marketplace/release-date/:extensionId',
        namedParams: { extensionId: 'yasht.terminal-all-in-one' },
        staticPreview: this.render({ releaseDate: '2019-04-13T07:50:27.000Z' }),
        keywords: this.keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'release date',
    }
  }

  static render({ releaseDate }) {
    return {
      message: formatDate(releaseDate),
      color: age(releaseDate),
    }
  }

  transform({ json }) {
    const { extension } = this.transformExtension({ json })
    const releaseDate = extension.releaseDate
    return { releaseDate }
  }

  async handle({ extensionId }) {
    const json = await this.fetch({ extensionId })
    const { releaseDate } = this.transform({ json })
    return this.constructor.render({ releaseDate })
  }
}
