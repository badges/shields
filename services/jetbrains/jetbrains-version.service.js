import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import JetbrainsBase from './jetbrains-base.js'

const intelliJschema = Joi.object({
  'plugin-repository': Joi.object({
    category: Joi.object({
      'idea-plugin': Joi.array()
        .min(1)
        .items(
          Joi.object({
            version: Joi.string().required(),
          }),
        )
        .single()
        .required(),
    }),
  }).required(),
}).required()

const jetbrainsSchema = Joi.array()
  .min(1)
  .items(
    Joi.object({
      version: Joi.string().required(),
    }).required(),
  )
  .required()

export default class JetbrainsVersion extends JetbrainsBase {
  static category = 'version'

  static route = {
    base: 'jetbrains/plugin/v',
    pattern: ':pluginId',
  }

  static openApi = {
    '/jetbrains/plugin/v/{pluginId}': {
      get: {
        summary: 'JetBrains Plugin Version',
        parameters: pathParams({
          name: 'pluginId',
          example: '9630',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'jetbrains plugin' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ pluginId }) {
    let version
    if (this.constructor._isLegacyPluginId(pluginId)) {
      const intelliJPluginData = await this.fetchIntelliJPluginData({
        pluginId,
        schema: intelliJschema,
      })
      version =
        intelliJPluginData['plugin-repository'].category['idea-plugin'][0]
          .version
    } else {
      const jetbrainsPluginData = await this._requestJson({
        schema: jetbrainsSchema,
        url: `https://plugins.jetbrains.com/api/plugins/${this.constructor._cleanPluginId(
          pluginId,
        )}/updates`,
        httpErrors: { 400: 'not found' },
      })
      version = jetbrainsPluginData[0].version
    }

    return this.constructor.render({ version })
  }
}
