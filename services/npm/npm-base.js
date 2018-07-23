'use strict';

const Joi = require('joi');
const { BaseJsonService } = require('../base');

const deprecatedLicenseObjectSchema = Joi.object({
  type: Joi.string().required(),
});
const schema = Joi.object({
  devDependencies: Joi.object().pattern(/./, Joi.string()),
  license: Joi.alternatives().try(
    Joi.string(),
    deprecatedLicenseObjectSchema,
    Joi.array().items(
      Joi.alternatives(Joi.string(), deprecatedLicenseObjectSchema)
    )
  ),
}).required();

// Abstract class for NPM badges which display data about the latest version
// of a package.
module.exports = class NpmBase extends BaseJsonService {
  static buildUrl(base, { withTag }) {
    if (withTag) {
      return {
        base,
        format: '(?:@([^/]+))?/?([^/]*)/?([^/]*)',
        capture: ['scope', 'packageName', 'tag'],
        queryParams: ['registry_uri'],
      };
    } else {
      return {
        base,
        format: '(?:@([^/]+)/)?([^/]+)',
        capture: ['scope', 'packageName'],
        queryParams: ['registry_uri'],
      };
    }
  }

  static get defaultRegistryUrl() {
    return 'https://registry.npmjs.org';
  }

  static encodeScopedPackage({ scope, packageName }) {
    // e.g. https://registry.npmjs.org/@cedx%2Fgulp-david
    const encoded = encodeURIComponent(`${scope}/${packageName}`);
    return `@${encoded}`;
  }

  async fetchPackageData({ registryUrl, scope, packageName }) {
    registryUrl = registryUrl || this.constructor.defaultRegistryUrl;
    let url;
    if (scope === undefined) {
      // e.g. https://registry.npmjs.org/express/latest
      // Use this endpoint as an optimization. It covers the vast majority of
      // these badges, and the response is smaller.
      url = `${registryUrl}/${packageName}/latest`;
    } else {
      // e.g. https://registry.npmjs.org/@cedx%2Fgulp-david
      // because https://registry.npmjs.org/@cedx%2Fgulp-david/latest does not work
      const scoped = this.constructor.encodeScopedPackage({
        scope,
        packageName,
      });
      url = `${registryUrl}/${scoped}`;
    }
    return this._requestJson({
      schema,
      url,
      // Use a custom Accept header because of this bug:
      // <https://github.com/npm/npmjs.org/issues/163>
      options: { Accept: '*/*' },
      notFoundMessage: 'package not found',
    });
  }
};
