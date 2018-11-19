'use strict'

const Joi = require('joi')
const JetbrainsBase = require('./jetbrains-base')
const { renderVersionBadge } = require('../../lib/version')

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

module.exports = class JetbrainsDownloads extends JetbrainsBase {
  static get category() {
    return 'version'
  }

  static get defaultBadgeData() {
    return { label: 'jetbrains plugin' }
  }

  static get examples() {
    return [
      {
        title: 'JetBrains IntelliJ Plugins',
        exampleUrl: '9630-a8translate',
        pattern: ':pluginId',
        staticExample: this.render({ version: 'v1.7' }),
      },
    ]
  }

  static get route() {
    return this.buildUrl('jetbrains/plugin/v')
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
