'use strict'

const { BaseXmlService, NotFound } = require('..')

module.exports = class JetbrainsBase extends BaseXmlService {
  static _validate(data, schema) {
    if (data['plugin-repository'] === '') {
      // Note the 'not found' response from JetBrains Plugins Repository is:
      // status code = 200,
      // body = <?xml version="1.0" encoding="UTF-8"?><plugin-repository></plugin-repository>
      // which is parsed to object = { 'plugin-repository': '' }
      throw new NotFound()
    }
    return super._validate(data, schema)
  }

  async fetchPackageData({ pluginId, schema }) {
    const parserOptions = {
      parseNodeValue: false,
      ignoreAttributes: false,
    }
    return this._requestXml({
      schema,
      url: `https://plugins.jetbrains.com/plugins/list?pluginId=${pluginId}`,
      parserOptions,
    })
  }
}
