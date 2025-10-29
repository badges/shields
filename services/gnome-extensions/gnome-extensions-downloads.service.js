import { renderDownloadsBadge } from '../downloads.js'
import { pathParams } from '../index.js'
import GnomeExtensionsBase from './gnome-extensions-base.js'

export default class GnomeExtensionsDownloads extends GnomeExtensionsBase {
  static category = 'downloads'

  static route = {
    base: 'gnome-extensions/downloads',
    pattern: ':extensionId',
  }

  static openApi = {
    '/gnome-extensions/downloads/{extensionId}': {
      get: {
        summary: 'Gnome Extensions Downloads',
        description: 'Gnome Extensions Downloads',
        parameters: pathParams({
          name: 'extensionId',
          description: 'Id of the Gnome Extension',
          example: 'just-perfection-desktop@just-perfection',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloads }) {
    return renderDownloadsBadge({ downloads })
  }

  async handle({ extensionId }) {
    const { downloads } = await this.getExtension({ extensionId })
    return this.constructor.render({ downloads })
  }
}
