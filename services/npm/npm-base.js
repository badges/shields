'use strict';

const {
  checkErrorResponse,
  asJson,
} = require('../../lib/error-helper');
const { BaseJsonService } = require('../base');

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

  static get defaultRegistryUrl () {
    return 'https://registry.npmjs.org';
  }

  static encodeScopedPackage({ scope, packageName }) {
    // e.g. https://registry.npmjs.org/@cedx%2Fgulp-david
    const encoded = encodeURIComponent(`${scope}/${packageName}`);
    return `@${encoded}`;
  }

  async _requestJson(url) {
    // The caller must validate the response. We don't validate here because
    // sometimes the caller needs to pluck the desired subkey first.
    //
    // This uses a custom Accept header because of this bug:
    // <https://github.com/npm/npmjs.org/issues/163>
    return this._sendAndCacheRequest(url, { headers: { Accept: '*/*' } })
      .then(checkErrorResponse.asPromise({ notFoundMessage: 'package not found' }))
      .then(asJson);
  }

  static render(packageData, namedParams, queryParams) {
    throw Error('Subclasses must override')
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, tag } = namedParams;
    let { registry_uri: registryUrl = this.constructor.defaultRegistryUrl } = queryParams;

    let packageData;
    if (scope === undefined) {
      // e.g. https://registry.npmjs.org/express/latest
      // Use this endpoint as an optimization. It covers the vast majority of
      // these badges, and the response is smaller.
      const url = `${registryUrl}/${packageName}/latest`;

      packageData = await this._requestJson(url);
    } else {
      // e.g. https://registry.npmjs.org/@cedx%2Fgulp-david
      // because https://registry.npmjs.org/@cedx%2Fgulp-david/latest does not work
      const scoped = this.constructor.encodeScopedPackage({ scope, packageName });
      const url = `${registryUrl}/${scoped}`;

      const json = await this._requestJson(url);
      const registryTag = tag || 'latest';
      const latestVersion = json['dist-tags'][registryTag];
      packageData = json.versions[latestVersion];
    }

    packageData = this.constructor.validateResponse(packageData);

    return this.constructor.render(packageData, namedParams, queryParams);
  }
}
