import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { BaseJsonService, pathParams } from '../index.js'

const extensionSchema = Joi.object({
  downloads: Joi.number().required(),
})

export default class GnomeExtensionsDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'gnome-extensions/dt',
    pattern: ':extensionId',
  }

  static openApi = {
    '/gnome-extensions/dt/{extensionId}': {
      get: {
        summary: 'Gnome Extensions Downloads',
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

  async getExtension({ extensionId }) {
    return await this._requestJson({
      schema: extensionSchema,
      url: `https://extensions.gnome.org/api/v1/extensions/${extensionId}/`,
      httpErrors: {
        404: 'extension not found',
      },
    })
  }

  async handle({ extensionId }) {
    const { downloads } = await this.getExtension({ extensionId })
    return this.constructor.render({ downloads })
  }
}
