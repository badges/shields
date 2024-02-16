import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
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

  static openApi = {
    '/visual-studio-marketplace/v/{extensionId}': {
      get: {
        summary: 'Visual Studio Marketplace Version',
        parameters: [
          pathParam({ name: 'extensionId', example: 'swellaby.rust-pack' }),
          queryParam({
            name: 'include_prereleases',
            schema: { type: 'boolean' },
            example: null,
          }),
        ],
      },
    },
  }

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
            ({ key, value }) => key === preReleaseKey && value === 'true',
          ),
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
