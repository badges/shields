'use strict';

const BaseService = require('../base');
const {
  checkErrorResponse,
  asJson,
} = require('../../lib/error-helper');

module.exports = class AppVeyor extends BaseService {
  async handle({repo, branch}) {
    let apiUrl = 'https://ci.appveyor.com/api/projects/' + repo;
    if (branch != null) {
      apiUrl += '/branch/' + branch;
    }
    const json = await this._sendAndCacheRequest(apiUrl, {
      headers: { 'Accept': 'application/json' }
    }).then(checkErrorResponse.asPromise({ notFoundMessage: 'project not found or access denied' }))
      .then(asJson);

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
