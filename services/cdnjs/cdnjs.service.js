'use strict';

const { BaseJsonService } = require('../base');
const { NotFound } = require('../errors');
const { addv: versionText } = require('../../lib/text-formatters');
const { version: versionColor} = require('../../lib/color-formatters');

module.exports = class Cdnjs extends BaseJsonService {
  async handle({library}) {
    const apiUrl = 'https://api.cdnjs.com/libraries/' + library + '?fields=version';
    const json = await this._requestJson(apiUrl);

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
      format: '(.+)',
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
