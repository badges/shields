'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { BaseXmlService, NotFound } = require('..')

const schema = Joi.object({
  metadata: Joi.object({
    versioning: Joi.object({
      versions: Joi.object({
        version: Joi.array().items(Joi.string().required()).single().required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

module.exports = class GradlePluginPortal extends BaseXmlService {
  static category = 'version'

  static route = {
    base: 'gradle-plugin-portal/v',
    pattern: ':pluginId/:versionPrefix?',
  }

  static examples = [
    {
      title: 'Gradle Plugin Portal',
      pattern: ':pluginId',
      namedParams: {
        pluginId: 'com.gradle.plugin-publish',
      },
      staticPreview: {
        label: 'plugin portal',
        message: 'v0.14.0',
        color: 'blue',
      },
    },
    {
      title: 'Gradle Plugin Portal with version prefix filter',
      pattern: ':pluginId/:versionPrefix',
      namedParams: {
        pluginId: 'com.gradle.plugin-publish',
        versionPrefix: '0.10',
      },
      staticPreview: {
        label: 'plugin portal',
        message: 'v0.10.1',
        color: 'blue',
      },
    },
  ]

  static defaultBadgeData = {
    label: 'plugin portal',
  }

  async fetch({ pluginId }) {
    const plugin = encodeURIComponent(pluginId)
    const group = plugin.replace(/\./g, '/')
    const artifact = `${plugin}.gradle.plugin`
    const url = `https://plugins.gradle.org/m2/${group}/${artifact}/maven-metadata.xml`
    return this._requestXml({
      schema,
      url,
      parserOptions: { parseNodeValue: false },
    })
  }

  async handle({ pluginId, versionPrefix }) {
    const data = await this.fetch({ pluginId })
    const versions = data.metadata.versioning.versions.version.reverse()
    let version = versions[0]
    if (versionPrefix !== undefined) {
      version = versions.filter(v => v.toString().startsWith(versionPrefix))[0]
      // if the filter returned no results, throw a NotFound
      if (version === undefined)
        throw new NotFound({ prettyMessage: 'version prefix not found' })
    }
    return renderVersionBadge({ version })
  }
}
