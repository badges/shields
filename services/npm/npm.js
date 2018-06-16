'use strict';

const BaseService = require('../base');
const {
  checkErrorResponse,
  asJson,
} = require('../../lib/error-helper');
const {
  makePackageDataUrl,
  typeDefinitions,
} = require('../../lib/npm-badge-helpers');

module.exports = class NPMTypeDefinitions extends BaseService {
  static get category() {
    return 'version';
  }

  static get defaultBadgeData() {
    return { label: 'type definitions' };
  }

  static get url() {
    return {
      base: 'npm/types',
      format: '(?:@([^/]+)/)?([^/]+)',
      capture: ['scope', 'packageName'],
      queryParams: ['registry_uri'],
    };
  }

  static get examples() {
    return [{
      title: 'npm type definitions',
      previewUrl: 'chalk',
      keywords: ['node', 'typescript', 'flow'],
    }];
  }

  async handle({ scope, packageName }, { registry_uri: registryUrl }) {
    const apiUrl = makePackageDataUrl({ registryUrl, scope, packageName });

    const json = await this._sendAndCacheRequest(apiUrl, {
      headers: { 'Accept': '*/*' },
    }).then(checkErrorResponse.asPromise('package not found'))
      .then(asJson);

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
