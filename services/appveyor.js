'use strict';

const BaseService = require('./base');

/**
 * AppVeyor CI integration.
 */
module.exports = class AppVeyor extends BaseService {
  async handle({repo, branch}) {
    let apiUrl = 'https://ci.appveyor.com/api/projects/' + repo;
    if (branch != null) {
      apiUrl += '/branch/' + branch;
    }
    const {buffer, res} = await this._sendAndCacheRequest(apiUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.statusCode === 404) {
      return {message: 'project not found or access denied'};
    }

    const data = JSON.parse(buffer);
    const status = data.build.status;
    if (status === 'success') {
      return {message: 'passing', colorscheme: 'brightgreen'};
    } else if (status !== 'running' && status !== 'queued') {
      return {message: 'failing', colorscheme: 'red'};
    } else {
      return {message: status};
    }
  }

  // Metadata
  static get category() {
    return 'build';
  }

  static get uri() {
    return {
      format: '/appveyor/ci/([^/]+/[^/]+)(?:/(.+))?',
      capture: ['repo', 'branch']
    };
  }

  static getExamples() {
    return [
      {
        uri: '/appveyor/ci/gruntjs/grunt',
      },
      {
        name: 'Branch',
        uri: '/appveyor/ci/gruntjs/grunt/master',
      },
    ];
  }
};
