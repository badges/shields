'use strict';

const BaseService = require('../base');
const {
  checkErrorResponse,
  asJson,
} = require('../../lib/error-helper');
const { NotFound } = require('../errors');
const { addv: versionText } = require('../../lib/text-formatters');
const { version: versionColor} = require('../../lib/color-formatters');

module.exports = class Cdnjs extends BaseService {
  async handle({library}) {
    const apiUrl = 'https://api.cdnjs.com/libraries/' + library + '?fields=version';
    const json = await this._sendAndCacheRequest(apiUrl, {
      headers: { 'Accept': 'application/json' }
    }).then(checkErrorResponse.asPromise())
      .then(asJson);

    if (Object.keys(json).length === 0) {
      /* Note the 'not found' response from cdnjs is:
         status code = 200, body = {} */
      throw new NotFound();
    }
    const version = json.version || 0;

    return {
      message: versionText(version),
      color: versionColor(version)
    };
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'cdnjs' };
  }

  static get category() {
    return 'version';
  }

  static get url() {
    return {
      base: 'cdnjs/v',
      format: '(.*)',
      capture: ['library']
    };
  }

  static get examples() {
    return [
      {
        previewUrl: 'jquery',
        keywords: [
          'cdn',
          'cdnjs'
        ]
      }
    ];
  }
};
