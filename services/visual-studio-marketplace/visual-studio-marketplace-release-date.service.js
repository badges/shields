import { pathParams } from '../index.js'
import { age } from '../color-formatters.js'
import { formatDate } from '../text-formatters.js'
import VisualStudioMarketplaceBase from './visual-studio-marketplace-base.js'

export default class VisualStudioMarketplaceReleaseDate extends VisualStudioMarketplaceBase {
  static category = 'activity'

  static route = {
    base: '',
    pattern:
      '(visual-studio-marketplace|vscode-marketplace)/release-date/:extensionId',
  }

  static openApi = {
    '/visual-studio-marketplace/release-date/{extensionId}': {
      get: {
        summary: 'Visual Studio Marketplace Release Date',
        parameters: pathParams({
          name: 'extensionId',
          example: 'yasht.terminal-all-in-one',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'release date',
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
