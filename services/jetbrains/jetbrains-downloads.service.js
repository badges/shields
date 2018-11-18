'use strict'

const Joi = require('joi')
const JetbrainsBase = require('./jetbrains-base')
const { metric } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')
const { nonNegativeInteger } = require('../validators')

const schema = Joi.object({
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

module.exports = class JetbrainsDownloads extends JetbrainsBase {
  static get category() {
    return 'downloads'
  }

  static get examples() {
    return [
      {
        title: 'JetBrains IntelliJ plugins',
        exampleUrl: '1347-scala',
        pattern: ':pluginId',
        staticExample: this.render({ downloads: 10200000 }),
      },
    ]
  }

  static get route() {
    return this.buildUrl('jetbrains/plugin/d')
  }

  static render({ downloads }) {
    return {
      message: `${metric(downloads)}`,
      color: downloadCountColor(downloads),
    }
  }

  async handle({ pluginId }) {
    const pluginData = await this.fetchPackageData({ pluginId, schema })
    const downloads =
      pluginData['plugin-repository'].category['idea-plugin'][0]['@_downloads']
    return this.constructor.render({ downloads })
  }
}
