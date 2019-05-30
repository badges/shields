'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const JetbrainsBase = require('./jetbrains-base')

const schema = Joi.object({
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

module.exports = class JetbrainsVersion extends JetbrainsBase {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'jetbrains/plugin/v',
      pattern: ':pluginId',
    }
  }

  static get examples() {
    return [
      {
        title: 'JetBrains IntelliJ Plugins',
        namedParams: {
          pluginId: '9630-a8translate',
        },
        staticPreview: this.render({ version: 'v1.7' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'jetbrains plugin' }
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ pluginId }) {
    const pluginData = await this.fetchPackageData({ pluginId, schema })
    const version =
      pluginData['plugin-repository'].category['idea-plugin'][0]['version']
    return this.constructor.render({ version })
  }
}
