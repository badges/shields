'use strict';

const { BaseJsonService } = require('../base');
const { NotFound } = require('../errors');
const { version: versionColor } = require('../../lib/color-formatters');

module.exports = class Clojars extends BaseJsonService {
  async handle({clojar}) {
    const apiUrl = 'https://clojars.org/' + clojar + '/latest-version.json';
    const json = await this._requestJson(apiUrl);

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
      format: '(.+)',
      capture: ['clojar']
    };
  }

  static get examples() {
    return [
      { previewUrl: 'prismic' }
    ];
  }

};
