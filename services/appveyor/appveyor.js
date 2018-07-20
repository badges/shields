'use strict';

const { BaseJsonService } = require('../base');

module.exports = class AppVeyor extends BaseJsonService {
  async handle({repo, branch}) {
    let apiUrl = 'https://ci.appveyor.com/api/projects/' + repo;
    if (branch != null) {
      apiUrl += '/branch/' + branch;
    }
    const json = await this._requestJson(apiUrl, {}, 'project not found or access denied');

    const { build: { status } } = json;
    if (status === 'success') {
      return {message: 'passing', color: 'brightgreen'};
    } else if (status !== 'running' && status !== 'queued') {
      return {message: 'failing', color: 'red'};
    } else {
      return {message: status};
    }
  }

  // Metadata
  static get category() {
    return 'build';
  }

  static get url() {
    return {
      base: 'appveyor/ci',
      format: '([^/]+/[^/]+)(?:/(.+))?',
      capture: ['repo', 'branch']
    };
  }

  static get examples() {
    return [
      {
        previewUrl: 'gruntjs/grunt',
      },
      {
        title: `${this.name} branch`,
        previewUrl: 'gruntjs/grunt/master',
      },
    ];
  }
};
