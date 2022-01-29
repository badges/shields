import { BaseXmlService, NotFound } from '../index.js'
import { parseJson } from '../../core/base-service/json.js'

/*
JetBrains is a bit awkward. Sometimes we want to call an XML API
and sometimes we want to call a JSON API so we need a mongrel base class.
When the legacy IntelliJ (XML) API is retired we can simplify all this and
switch JetbrainsDownloads, JetbrainsRating and JetbrainsVersion to just
inherit from BaseJsonService directly.
*/
export default class JetbrainsBase extends BaseXmlService {
  static _isLegacyPluginId(pluginId) {
    return !pluginId.match(/^([0-9])+/)
  }

  static _cleanPluginId(pluginId) {
    const match = pluginId.match(/^([0-9])+/)
    if (match) {
      return match[0]
    }
    return pluginId
  }

  // xml
  static _validate(data, schema) {
    if (data['plugin-repository'] === '') {
      // Note the 'not found' response from JetBrains IntelliJ API is:
      // status code = 200,
      // body = <?xml version="1.0" encoding="UTF-8"?><plugin-repository></plugin-repository>
      // which is parsed to object = { 'plugin-repository': '' }
      throw new NotFound()
    }
    return super._validate(data, schema)
  }

  async fetchIntelliJPluginData({ pluginId, schema }) {
    const parserOptions = {
      parseTagValue: false,
      ignoreAttributes: false,
    }
    return this._requestXml({
      schema,
      url: `https://plugins.jetbrains.com/plugins/list?pluginId=${pluginId}`,
      parserOptions,
    })
  }

  // json
  _parseJson(buffer) {
    return parseJson(buffer)
  }

  static _validateJson(data, schema) {
    return super._validate(data, schema)
  }

  async _requestJson({ schema, url, options = {}, errorMessages = {} }) {
    const mergedOptions = {
      ...{ headers: { Accept: 'application/json' } },
      ...options,
    }
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      errorMessages,
    })
    const json = this._parseJson(buffer)
    return this.constructor._validateJson(json, schema)
  }
}
