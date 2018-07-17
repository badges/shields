'use strict';

const { BaseJsonService } = require('../base');
const { version: versionColor} = require('../../lib/color-formatters');
const {
  metric,
  addv
} = require('../../lib/text-formatters');

module.exports = class AppVeyor extends BaseJsonService {
  async handle({info, repo}) {
    const apiUrl = 'https://atom.io/api/packages/' + repo;
    const json = await this._requestJson(apiUrl, {}, 'package not found');

    if (info == 'dm'){
        var downloads = json.downloads;
        return {label: 'downloads', message: metric(downloads), color: 'green'};
    } else if (info == 'v'){
        var version = json.releases.latest;
        if (!version)
          throw Error('Invalid version');
        return {message: addv(version), color: versionColor(version)};
    }else if (info == 'l'){
        var license = json.metadata.license;
        if (!license)
          throw Error('Invalid license');
        return {label: 'license', message: license, color: 'blue'};
    }
  }

  static get defaultBadgeData() {
    return { label: 'apm' };
  }
  
  static get category() {
    return 'version';
  }

  static get url() {
    return {
      base: 'apm',
      format: '(dm|l|v)\/(.+)',
      capture: ['info', 'repo']
    };
  }

  static get examples() {
    return [
      {
        previewUrl: 'dm/vim-mode',
      },
      {
        previewUrl: 'v/vim-mode',
      },
      {
        previewUrl: 'l/vim-mode',
      },
    ];
  }
};
