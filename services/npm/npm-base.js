'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { InvalidResponse, NotFound } = require('../errors')
const serverSecrets = require('../../lib/server-secrets')

const deprecatedLicenseObjectSchema = Joi.object({
  type: Joi.string().required(),
})
const schema = Joi.object({
  devDependencies: Joi.object()
    .pattern(/./, Joi.string())
    .default({}),
  engines: Joi.object().pattern(/./, Joi.string()),
  license: Joi.alternatives().try(
    Joi.string(),
    deprecatedLicenseObjectSchema,
    Joi.array().items(
      Joi.alternatives(Joi.string(), deprecatedLicenseObjectSchema)
    )
  ),
  types: Joi.string(),
  files: Joi.array()
    .items(Joi.string())
    .default([]),
}).required()

// Abstract class for NPM badges which display data about the latest version
// of a package.
module.exports = class NpmBase extends BaseJsonService {
  static buildUrl(base, { withTag } = {}) {
    if (withTag) {
      return {
        base,
        format: '(?:@([^/]+))?/?([^/]*)/?([^/]*)',
        capture: ['scope', 'packageName', 'tag'],
        queryParams: ['registry_uri'],
      }
    } else {
      return {
        base,
        format: '(?:@([^/]+)/)?([^/]+)',
        capture: ['scope', 'packageName'],
        queryParams: ['registry_uri'],
      }
    }
  }

  static unpackParams(
    { scope, packageName, tag },
    { registry_uri: registryUrl = 'https://registry.npmjs.org' }
  ) {
    return {
      scope,
      packageName,
      tag,
      registryUrl,
    }
  }

  static encodeScopedPackage({ scope, packageName }) {
    // e.g. https://registry.npmjs.org/@cedx%2Fgulp-david
    const encoded = encodeURIComponent(`${scope}/${packageName}`)
    return `@${encoded}`
  }

  async _requestJson(data) {
    // Use a custom Accept header because of this bug:
    // <https://github.com/npm/npmjs.org/issues/163>
    const headers = { Accept: '*/*' }
    if (serverSecrets.npm_token) {
      headers.Authorization = `Bearer ${serverSecrets.npm_token}`
    }
    return super._requestJson({
      ...data,
      options: { headers },
    })
  }

  async fetchPackageData({ registryUrl, scope, packageName, tag }) {
    registryUrl = registryUrl || this.constructor.defaultRegistryUrl
    let url
    if (scope === undefined) {
      // e.g. https://registry.npmjs.org/express/latest
      // Use this endpoint as an optimization. It covers the vast majority of
      // these badges, and the response is smaller.
      url = `${registryUrl}/${packageName}/latest`
    } else {
      // e.g. https://registry.npmjs.org/@cedx%2Fgulp-david
      // because https://registry.npmjs.org/@cedx%2Fgulp-david/latest does not work
      const scoped = this.constructor.encodeScopedPackage({
        scope,
        packageName,
      })
      url = `${registryUrl}/${scoped}`
    }
    const json = await this._requestJson({
      // We don't validate here because we need to pluck the desired subkey first.
      schema: Joi.any(),
      url,
      errorMessages: { 404: 'package not found' },
    })

    let packageData
    if (scope === undefined) {
      packageData = json
    } else {
      const registryTag = tag || 'latest'
      let latestVersion
      try {
        latestVersion = json['dist-tags'][registryTag]
      } catch (e) {
        throw new NotFound({ prettyMessage: 'tag not found' })
      }
      try {
        packageData = json.versions[latestVersion]
      } catch (e) {
        throw new InvalidResponse({ prettyMessage: 'invalid json response' })
      }
    }

    return this.constructor._validate(packageData, schema)
  }
}
