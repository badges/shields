'use strict';

const { BaseJsonService } = require('../base');
const { version: versionColor} = require('../../lib/color-formatters');
const {
  metric,
  addv
} = require('../../lib/text-formatters');

class APMDownloads extends BaseJsonService {
  async handle({repo}) {
    const apiUrl = 'https://atom.io/api/packages/' + repo;
    const json = await this._requestJson(apiUrl, {}, 'package not found');

    const downloads = json.downloads;
    return {message: metric(downloads), color: 'green'};
  }
  
  static get category() {
    return 'downloads';
  }

  static get url() {
    return {
      base: 'apm/dm',
      format: '(.+)',
      capture: ['repo']
    };
  }

  static get examples() {
    return [
      {
        previewUrl: 'dm/vim-mode',
        keywords: [
          'atom'
        ]
      },
    ];
  }
};

class APMVersion extends BaseJsonService {
  async handle({repo}) {
    const apiUrl = 'https://atom.io/api/packages/' + repo;
    const json = await this._requestJson(apiUrl, {}, 'package not found');

    const version = json.releases.latest;
    if (!version)
      throw InvalidResponse('Invalid version');
    return {message: addv(version), color: versionColor(version)};
  }

  static get defaultBadgeData() {
    return { label: 'apm' };
  }
  
  static get category() {
    return 'version';
  }

  static get url() {
    return {
      base: 'apm/v',
      format: '(.+)',
      capture: ['repo']
    };
  }

  static get examples() {
    return [
      {
        previewUrl: 'v/vim-mode',
        keywords: [
          'atom'
        ]
      },
    ];
  }
};

class APMLicense extends BaseJsonService {
  async handle({repo}) {
    const apiUrl = 'https://atom.io/api/packages/' + repo;
    const json = await this._requestJson(apiUrl, {}, 'package not found');

    const license = json.metadata.license;
    if (!license)
      throw InvalidResponse('Invalid license');
    return {message: license, color: 'blue'};
  }

  static get defaultBadgeData() {
    return { label: 'license' };
  }
  
  static get category() {
    return 'miscellaneous';
  }

  static get url() {
    return {
      base: 'apm/l',
      format: '(.+)',
      capture: ['repo']
    };
  }

  static get examples() {
    return [
      {
        previewUrl: 'l/vim-mode',
        keywords: [
          'atom'
        ]
      },
    ];
  }
};

module.exports = {
  APMDownloads,
  APMVersion,
  APMLicense,
}
