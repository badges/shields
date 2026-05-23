import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'

const versionSchema = Joi.object({
  results: Joi.array()
    .items(
      Joi.object({
        version: Joi.number().required(),
        version_name: Joi.string().allow(null).required(),
        status: Joi.number().required(),
      }).unknown(true),
    )
    .required(),
}).unknown(true)

const ACTIVE_STATUS = 3

export default class GnomeExtensionsVersion extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'gnome-extensions/v',
    pattern: ':extensionId',
  }

  static openApi = {
    '/gnome-extensions/v/{extensionId}': {
      get: {
        summary: 'Gnome Extensions Version',
        parameters: pathParams({
          name: 'extensionId',
          description: 'Id of the Gnome Extension',
          example: 'just-perfection-desktop@just-perfection',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'version' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async getVersions({ extensionId }) {
    return await this._requestJson({
      schema: versionSchema,
      url: `https://extensions.gnome.org/api/v1/extensions/${extensionId}/versions/?page_size=100`,
      httpErrors: {
        404: 'extension not found',
      },
    })
  }

  async handle({ extensionId }) {
    const { results } = await this.getVersions({ extensionId })
    const activeVersions = results.filter(r => r.status === ACTIVE_STATUS)
    if (activeVersions.length === 0) {
      throw new NotFound({ prettyMessage: 'no active version found' })
    }
    const latest = activeVersions.reduce((a, b) =>
      a.version > b.version ? a : b,
    )
    const version = latest.version_name ?? String(latest.version)
    return this.constructor.render({ version })
  }
}
