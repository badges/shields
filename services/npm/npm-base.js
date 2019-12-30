'use strict'

const Joi = require('@hapi/joi')
const { optionalUrl } = require('../validators')
const { isDependencyMap } = require('../package-json-helpers')
const { BaseJsonService, InvalidResponse, NotFound } = require('..')

const deprecatedLicenseObjectSchema = Joi.object({
  type: Joi.string().required(),
})
const packageDataSchema = Joi.object({
  dependencies: isDependencyMap,
  devDependencies: isDependencyMap,
  peerDependencies: isDependencyMap,
  engines: Joi.object().pattern(/./, Joi.string()),
  license: Joi.alternatives().try(
    Joi.string(),
    deprecatedLicenseObjectSchema,
    Joi.array().items(
      Joi.alternatives(Joi.string(), deprecatedLicenseObjectSchema)
    )
  ),
  maintainers: Joi.array()
    // We don't need the keys here, just the length.
    .items(Joi.object({}))
    .required(),
  types: Joi.string(),
  // `typings` is an alias for `types` and often used
  // https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#including-declarations-in-your-npm-package
  // > Note that the "typings" field is synonymous with "types"
  typings: Joi.string(),
  files: Joi.array()
    .items(Joi.string())
    .default([]),
}).required()

const queryParamSchema = Joi.object({
  registry_uri: optionalUrl,
}).required()

// Abstract class for NPM badges which display data about the latest version
// of a package.
module.exports = class NpmBase extends BaseJsonService {
  static get auth() {
    return { passKey: 'npm_token' }
  }

  static buildRoute(base, { withTag } = {}) {
    if (withTag) {
      return {
        base,
        pattern: ':scope(@[^/]+)?/:packageName/:tag?',
        queryParamSchema,
      }
    } else {
      return {
        base,
        pattern: ':scope(@[^/]+)?/:packageName',
        queryParamSchema,
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
    const scopeWithoutAt = scope.replace(/^@/, '')
    // e.g. https://registry.npmjs.org/@cedx%2Fgulp-david
    const encoded = encodeURIComponent(`${scopeWithoutAt}/${packageName}`)
    return `@${encoded}`
  }

  async _requestJson(data) {
    return super._requestJson({
      ...data,
      options: {
        headers: {
          // Use a custom Accept header because of this bug:
          // <https://github.com/npm/npmjs.org/issues/163>
          Accept: '*/*',
          ...this.authHelper.bearerAuthHeader,
        },
      },
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

    return this.constructor._validate(packageData, packageDataSchema)
  }
}

module.exports.queryParamSchema = queryParamSchema
