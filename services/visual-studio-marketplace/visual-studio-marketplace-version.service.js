import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import VisualStudioMarketplaceBase from './visual-studio-marketplace-base.js'

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
}).required()

export default class VisualStudioMarketplaceVersion extends VisualStudioMarketplaceBase {
  static category = 'version'

  static route = {
    base: '',
    pattern: '(visual-studio-marketplace|vscode-marketplace)/v/:extensionId',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Visual Studio Marketplace Version',
      pattern: 'visual-studio-marketplace/v/:extensionId',
      namedParams: { extensionId: 'swellaby.rust-pack' },
      staticPreview: this.render({ version: '0.2.7' }),
      keywords: this.keywords,
    },
    {
      title: 'Visual Studio Marketplace Version (including pre-releases)',
      pattern: 'visual-studio-marketplace/v/:extensionId',
      namedParams: { extensionId: 'swellaby.rust-pack' },
      queryParams: { include_prereleases: null },
      staticPreview: this.render({ version: '0.2.9-dev' }),
      keywords: this.keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'version',
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  transform({ json }, includePrereleases) {
    const { extension } = this.transformExtension({ json })
    const preReleaseKey = 'Microsoft.VisualStudio.Code.PreRelease'
    let version

    if (!includePrereleases) {
      version = extension.versions.find(
        obj =>
          !obj.properties.find(
            ({ key, value }) => key === preReleaseKey && value === 'true'
          )
      )?.version
    }

    // this condition acts as the 'else' clause AND as a fallback,
    // in case all versions are pre-release
    if (!version) {
      version = extension.versions[0].version
    }

    return { version }
  }

  async handle({ extensionId }, queryParams) {
    const json = await this.fetch({ extensionId })
    const includePrereleases = queryParams.include_prereleases !== undefined
    const { version } = this.transform({ json }, includePrereleases)

    return this.constructor.render({ version })
  }
}
