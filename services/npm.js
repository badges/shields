'use strict';

const BaseService = require('./base');
const {
  checkErrorResponse,
  getJson,
} = require('../lib/error-helper');
const {
  makePackageDataUrl,
  typeDefinitions,
} = require('../lib/npm-badge-helpers');

module.exports = class NPMTypeDefinitions extends BaseService {
  static get category() {
    return 'version';
  }

  static get defaultBadgeData() {
    return { label: 'type definitions' };
  }

  static get uri() {
    return {
      format: '/npm/types/(?:@([^/]+)/)?([^/]+)',
      capture: ['scope', 'packageName'],
      queryParams: ['registry_uri'],
    };
  }

  async handle({ scope, packageName }, { registry_uri: registryUrl }) {
    const apiUrl = makePackageDataUrl({ registryUrl, scope, packageName });

    const { buffer } = await this._sendAndCacheRequest(apiUrl, {
      headers: { 'Accept': '*/*' },
    }).then(checkErrorResponse.asPromise({ notFoundMessage: 'package not found' }));

    const json = getJson(buffer);
    let packageData;
    if (scope === undefined) {
      packageData = json;
    } else {
      const latestVersion = json['dist-tags'].latest;
      packageData = json.versions[latestVersion];
    }

    const message = typeDefinitions(packageData);
    return {
      message,
      color: message === 'none' ? 'lightgray' : 'blue',
    };
  }
};
