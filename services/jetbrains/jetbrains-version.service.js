'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const JetbrainsBase = require('./jetbrains-base')

const intelliJschema = Joi.object({
  'plugin-repository': Joi.object({
    category: Joi.object({
      'idea-plugin': Joi.array()
        .min(1)
        .items(
          Joi.object({
            version: Joi.string().required(),
          })
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
    }).required()
  )
  .required()

module.exports = class JetbrainsVersion extends JetbrainsBase {
  static category = 'version'

  static route = {
    base: 'jetbrains/plugin/v',
    pattern: ':pluginId',
  }

  static examples = [
    {
      title: 'JetBrains Plugins',
      namedParams: {
        pluginId: '9630',
      },
      staticPreview: this.render({ version: 'v1.7' }),
    },
  ]

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
          pluginId
        )}/updates`,
        errorMessages: { 400: 'not found' },
      })
      version = jetbrainsPluginData[0].version
    }

    return this.constructor.render({ version })
  }
}
