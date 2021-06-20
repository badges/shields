import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { downloadCount as downloadCountColor } from '../color-formatters.js'
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
          })
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

  static examples = [
    {
      title: 'JetBrains plugins',
      namedParams: {
        pluginId: '1347',
      },
      staticPreview: this.render({ downloads: 10200000 }),
    },
  ]

  static render({ downloads }) {
    return {
      message: `${metric(downloads)}`,
      color: downloadCountColor(downloads),
    }
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
          pluginId
        )}`,
        errorMessages: { 400: 'not found' },
      })
      downloads = jetbrainsPluginData.downloads
    }

    return this.constructor.render({ downloads })
  }
}
