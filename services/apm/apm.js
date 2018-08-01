'use strict';

const { BaseJsonService } = require('../base');
const { InvalidResponse } = require('../errors');
const { version: versionColor } = require('../../lib/color-formatters');
const {
  metric,
  addv
} = require('../../lib/text-formatters');

class BaseAPMService extends BaseJsonService {

  async fetch(repo) {
    const apiUrl = 'https://atom.io/api/packages/' + repo;
    return this._requestJson(apiUrl, {}, 'package not found');
  }

  static get defaultBadgeData() {
    return { label: 'apm' };
  }

}

class APMDownloads extends BaseAPMService {
  async handle({repo}) {
    const json = await this.fetch(repo);

    const downloads = json.downloads;
    return {message: metric(downloads), color: 'green'};
  }

  static get category() {
    return 'downloads';
  }

  static get defaultBadgeData() {
    return { label: 'downloads' };
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

class APMVersion extends BaseAPMService {
  async handle({repo}) {
    const json = await this.fetch(repo);

    const version = json.releases.latest;
    if (!version)
      throw new InvalidResponse({ underlyingError: new Error('version is invalid') });
    return {message: addv(version), color: versionColor(version)};
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

class APMLicense extends BaseAPMService {
  async handle({repo}) {
    const json = await this.fetch(repo);

    const license = json.metadata.license;
    if (!license)
      throw new InvalidResponse({ underlyingError: new Error('licence is invalid') });
    return {message: license, color: 'blue'};
  }

  static get defaultBadgeData() {
    return { label: 'license' };
  }

  static get category() {
    return 'license';
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
