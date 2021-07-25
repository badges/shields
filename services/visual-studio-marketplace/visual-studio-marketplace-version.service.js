import { renderVersionBadge } from '../version.js'
import VisualStudioMarketplaceBase from './visual-studio-marketplace-base.js'

export default class VisualStudioMarketplaceVersion extends VisualStudioMarketplaceBase {
  static category = 'version'

  static route = {
    base: '',
    pattern: '(visual-studio-marketplace|vscode-marketplace)/v/:extensionId',
  }

  static examples = [
    {
      title: 'Visual Studio Marketplace Version',
      pattern: 'visual-studio-marketplace/v/:extensionId',
      namedParams: { extensionId: 'swellaby.rust-pack' },
      staticPreview: this.render({ version: '0.2.7' }),
      keywords: this.keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'version',
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
