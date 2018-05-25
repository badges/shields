'use strict';

const BaseService = require('../base');
const {
  checkErrorResponse,
  asJson,
} = require('../../lib/error-helper');
const { NotFound } = require('../errors');
const { version: versionColor} = require('../../lib/color-formatters');

module.exports = class Clojars extends BaseService {
  async handle({clojar}) {
    const apiUrl = 'https://clojars.org/' + clojar + '/latest-version.json';
    const json = await this._sendAndCacheRequest(apiUrl, {
      headers: { 'Accept': 'application/json' }
    }).then(checkErrorResponse.asPromise())
      .then(asJson);

    if (Object.keys(json).length === 0) {
      /* Note the 'not found' response from clojars is:
          status code = 200, body = {} */
      throw new NotFound();
    }

    return {
      message: "[" + clojar + " \"" + json.version + "\"]",
      color: versionColor(json.version)
    };
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'clojars' };
  }

  static get category() {
    return 'version';
  }

  static get url() {
    return {
      base: 'clojars/v',
      format: '(.*)',
      capture: ['clojar']
    };
  }

  static get examples() {
    return [
      { previewUrl: 'prismic' }
    ];
  }

};
