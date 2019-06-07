'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { downloadCount: downloadCountColor } = require('../color-formatters')
const { nonNegativeInteger } = require('../validators')
const JetbrainsBase = require('./jetbrains-base')

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

  static get route() {
    return {
      base: 'jetbrains/plugin/d',
      pattern: ':pluginId',
    }
  }

  static get examples() {
    return [
      {
        title: 'JetBrains IntelliJ plugins',
        namedParams: {
          pluginId: '1347-scala',
        },
        staticPreview: this.render({ downloads: 10200000 }),
      },
    ]
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
