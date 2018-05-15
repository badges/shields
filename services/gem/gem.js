'use strict';

const semver = require('semver');

const BaseService = require('../base');
const {
  checkErrorResponse,
  asJson,
} = require('../../lib/error-helper');
const { InvalidResponse } = require('../errors');
const { addv: versionText } = require('../../lib/text-formatters');
const { version: versionColor} = require('../../lib/color-formatters');
const {
  floorCount: floorCountColor,
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters');
const {
  metric,
  ordinalNumber,
} = require('../../lib/text-formatters');
const { latest: latestVersion } = require('../../lib/version');


class GemVersion extends BaseService {
  async handle({repo}) {
    const apiUrl = 'https://rubygems.org/api/v1/gems/' + repo + '.json';
    const json = await this._sendAndCacheRequest(apiUrl, {
      headers: { 'Accept': 'application/json' }
    }).then(checkErrorResponse.asPromise())
      .then(asJson);
    const version = json.version;

    return {
      message: versionText(version),
      color: versionColor(version)
    };
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'gem' };
  }

  static get category() {
    return 'version';
  }

  static get url() {
    return {
      base: 'gem/v',
      format: '(.*)',
      capture: ['repo']
    };
  }

  static get examples() {
    return [
      {
        title: 'Gem',
        previewUrl: 'formatador',
        keywords: [
          'ruby'
        ]
      }
    ];
  }
};

class GemDownloads extends BaseService {

  _getApiUrl(repo, info) {
    const endpoint = info === "dv" ? 'versions/' : 'gems/';
    return `https://rubygems.org/api/v1/${endpoint}${repo}.json`;
  }

  _getLabel(version, info) {
    if (version) {
      return 'downloads@' + version;
    } else {
      if (info === "dtv") {
        return 'downloads@latest';
      } else {
        return 'downloads';
      }
    }
  }

  async handle({info, rubygem}) {
    const splitRubygem = rubygem.split('/');
    const repo = splitRubygem[0];
    let version = (splitRubygem.length > 1)
      ? splitRubygem[splitRubygem.length - 1]
      : null;
    version = (version === "stable") ? version : semver.valid(version);
    const label = this._getLabel(version, info);
    const apiUrl = this._getApiUrl(repo, info);
    const json = await this._sendAndCacheRequest(apiUrl, {
      headers: { 'Accept': 'application/atom+json,application/json' }
    }).then(checkErrorResponse.asPromise())
      .then(asJson);

    let downloads;
    if (info === "dt") {
      downloads = metric(json.downloads);
    } else if (info === "dtv") {
      downloads = metric(json.version_downloads);
    } else if (info === "dv") {

      let versionData;
      if (version !== null && version === "stable") {

        const versions = json.filter(function(ver) {
          return ver.prerelease === false;
        }).map(function(ver) {
          return ver.number;
        });
        // Found latest stable version.
        const stableVersion = latestVersion(versions);
        versionData = json.filter(function(ver) {
          return ver.number === stableVersion;
        })[0];
        downloads = metric(versionData.downloads_count);

      } else if (version !== null) {

        versionData = json.filter(function(ver) {
          return ver.number === version;
        })[0];

        downloads = metric(versionData.downloads_count);
      } else {
        throw new InvalidResponse({ underlyingError: new Error('version is null') });
      }

    } else {
      throw new InvalidResponse({ underlyingError: new Error('info is invalid') });
    }

    return {
      label: label,
      message: downloads,
      color: downloadCountColor(downloads),
    };
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'downloads' };
  }

  static get category() {
    return 'downloads';
  }

  static get url() {
    return {
      base: 'gem',
      format: '(dt|dtv|dv)/(.*)',
      capture: ['info', 'rubygem']
    };
  }

  static get examples() {
    return [
      {
        title: 'Gem',
        previewUrl: 'dv/rails/stable',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'Gem',
        previewUrl: 'dv/rails/4.1.0',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'Gem',
        previewUrl: 'dtv/rails',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'Gem',
        previewUrl: 'dt/rails',
        keywords: [
          'ruby'
        ]
      },
    ];
  }
};

class GemOwner extends BaseService {

  async handle({user}) {
    const apiUrl = 'https://rubygems.org/api/v1/owners/' + user + '/gems.json';
    const json = await this._sendAndCacheRequest(apiUrl, {
      headers: { 'Accept': 'application/json' }
    }).then(checkErrorResponse.asPromise())
      .then(asJson);
    const count = json.length;

    return {
      message: count,
      color: floorCountColor(count, 10, 50, 100)
    };
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'gems' };
  }

  static get category() {
    return 'miscellaneous';
  }

  static get url() {
    return {
      base: 'gem/u',
      format: '(.*)',
      capture: ['user']
    };
  }

  static get examples() {
    return [
      {
        title: 'Gems',
        previewUrl: 'raphink',
        keywords: [
          'ruby'
        ]
      }
    ];
  }
};

class GemRank extends BaseService {

  _getApiUrl(repo, totalRank, dailyRank) {
    let endpoint;
    if (totalRank) {
      endpoint = '/total_ranking.json';
    } else if (dailyRank) {
      endpoint = '/daily_ranking.json';
    }
    return `http://bestgems.org/api/v1/gems/${repo}${endpoint}`;
  }

  async handle({info, repo}) {
    const totalRank = (info === 'rt');
    const dailyRank = (info === 'rd');
    const apiUrl = this._getApiUrl(repo, totalRank, dailyRank);
    const json = await this._sendAndCacheRequest(apiUrl, {
      headers: { 'Accept': 'application/json' }
    }).then(checkErrorResponse.asPromise())
      .then(asJson);

    let rank;
    if (totalRank) {
      rank = json[0].total_ranking;
    } else if (dailyRank) {
      rank = json[0].daily_ranking;
    }
    const count = Math.floor(100000 / rank);
    let message = ordinalNumber(rank);
    message += totalRank ? '' : ' daily'

    return {
      message: message,
      color: floorCountColor(count, 10, 50, 100)
    };
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'rank' };
  }

  static get category() {
    return 'miscellaneous';
  }

  static get url() {
    return {
      base: 'gem',
      format: '(rt|rd)/(.*)',
      capture: ['info', 'repo']
    };
  }

  static get examples() {
    return [
      {
        title: 'Gems',
        previewUrl: 'rt/puppet',
        keywords: [
          'ruby'
        ]
      },
      {
        title: 'Gems',
        previewUrl: 'rd/facter',
        keywords: [
          'ruby'
        ]
      }
    ];
  }
};

module.exports = {
  GemVersion,
  GemDownloads,
  GemOwner,
  GemRank,
}
