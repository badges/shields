'use strict'

const Joi = require('joi')
const BaseXmlService = require('../base-xml')
const { NotFound } = require('../errors')

module.exports = class JetbrainsBase extends BaseXmlService {
  static buildUrl(base) {
    return {
      base,
      format: '(.+)',
      capture: ['pluginId'],
    }
  }

  async fetchPackageData({ pluginId, schema }) {
    const parserOptions = {
      parseNodeValue: false,
      ignoreAttributes: false,
    }
    const pluginData = await this._requestXml({
      schema: Joi.object({
        'plugin-repository': Joi.any().required(),
      }),
      url: `https://plugins.jetbrains.com/plugins/list?pluginId=${pluginId}`,
      parserOptions,
    })
    if (!pluginData['plugin-repository']) {
      throw new NotFound()
    }
    return this.constructor._validate(pluginData, schema)
  }
}
