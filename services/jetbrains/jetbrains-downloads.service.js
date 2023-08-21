import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'
import JetbrainsBase from './jetbrains-base.js'

const intelliJschema = Joi.object({
  'plugin-repository': Joi.object({
    category: Joi.object({
      'idea-plugin': Joi.array()
        .min(1)
        .items(
          Joi.object({
            '@_downloads': nonNegativeInteger,
          }),
        )
        .single()
        .required(),
    }),
  }).required(),
}).required()

const jetbrainsSchema = Joi.object({ downloads: nonNegativeInteger }).required()

export default class JetbrainsDownloads extends JetbrainsBase {
  static category = 'downloads'

  static route = {
    base: 'jetbrains/plugin/d',
    pattern: ':pluginId',
  }

  static openApi = {
    '/jetbrains/plugin/d/{pluginId}': {
      get: {
        summary: 'JetBrains Plugin Downloads',
        parameters: pathParams({
          name: 'pluginId',
          example: '1347',
        }),
      },
    },
  }

  async handle({ pluginId }) {
    let downloads
    if (this.constructor._isLegacyPluginId(pluginId)) {
      const intelliJPluginData = await this.fetchIntelliJPluginData({
        pluginId,
        schema: intelliJschema,
      })
      downloads =
        intelliJPluginData['plugin-repository'].category['idea-plugin'][0][
          '@_downloads'
        ]
    } else {
      const jetbrainsPluginData = await this._requestJson({
        schema: jetbrainsSchema,
        url: `https://plugins.jetbrains.com/api/plugins/${this.constructor._cleanPluginId(
          pluginId,
        )}`,
        httpErrors: { 400: 'not found' },
      })
      downloads = jetbrainsPluginData.downloads
    }

    return renderDownloadsBadge({ downloads })
  }
}
