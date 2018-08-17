'use strict';

const countBy = require('lodash.countby');
const dom = require('xmldom').DOMParser;
const jp = require('jsonpath');
const moment = require('moment');
const path = require('path');
const prettyBytes = require('pretty-bytes');
const queryString = require('query-string');
const semver = require('semver');
const xml2js = require('xml2js');
const xpath = require('xpath');
const yaml = require('js-yaml');
const Raven = require('raven');

const serverSecrets = require('./lib/server-secrets');
Raven.config(process.env.SENTRY_DSN || serverSecrets.sentry_dsn).install();
Raven.disableConsoleAlerts();

const { loadServiceClasses } = require('./services');
const { isDeprecated, getDeprecatedBadge } = require('./lib/deprecation-helpers');
const { checkErrorResponse } = require('./lib/error-helper');
const analytics = require('./lib/analytics');
const config = require('./lib/server-config');
const GithubConstellation = require('./services/github/github-constellation');
const sysMonitor = require('./lib/sys/monitor');
const log = require('./lib/log');
const { makeMakeBadgeFn } = require('./lib/make-badge');
const { QuickTextMeasurer } = require('./lib/text-measurer');
const suggest = require('./lib/suggest');
const { licenseToColor } = require('./lib/licenses');
const { latest: latestVersion } = require('./lib/version');
const {
  compare: phpVersionCompare,
  latest: phpLatestVersion,
  isStable: phpStableVersion,
  minorVersion: phpMinorVersion,
  versionReduction: phpVersionReduction,
  getPhpReleases,
} = require('./lib/php-version');
const {
  parseVersion: luarocksParseVersion,
  compareVersionLists: luarocksCompareVersionLists,
} = require('./lib/luarocks-version');
const {
  currencyFromCode,
  metric,
  starRating,
  omitv,
  addv: versionText,
  maybePluralize,
  formatDate,
} = require('./lib/text-formatters');
const {
  coveragePercentage: coveragePercentageColor,
  downloadCount: downloadCountColor,
  floorCount: floorCountColor,
  letterScore: letterScoreColor,
  version: versionColor,
  age: ageColor,
  colorScale,
} = require('./lib/color-formatters');
const {
  makeColorB,
  makeLabel: getLabel,
  makeLogo: getLogo,
  makeBadgeData: getBadgeData,
  setBadgeColor,
} = require('./lib/badge-data');
const {
  makeHandleRequestFn,
  clearRequestCache,
} = require('./lib/request-handler');
const {
  regularUpdate,
  clearRegularUpdateCache,
} = require('./lib/regular-update');
const { makeSend } = require('./lib/result-sender');
const { fetchFromSvg } = require('./lib/svg-badge-parser');
const {
  escapeFormat,
  escapeFormatSlashes,
} = require('./lib/path-helpers');
const {
  isSnapshotVersion: isNexusSnapshotVersion,
} = require('./lib/nexus-version');
const {
  teamcityBadge,
} = require('./lib/teamcity-badge-helpers');
const {
  mapNugetFeedv2,
  mapNugetFeed,
} = require('./lib/nuget-provider');
const {
  getVscodeApiReqOptions,
  getVscodeStatistic,
} = require('./lib/vscode-badge-helpers');
const {
  stateColor: githubStateColor,
  checkStateColor: githubCheckStateColor,
  commentsColor: githubCommentsColor,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./lib/github-helpers');
const {
  mapGithubCommitsSince,
  mapGithubReleaseDate,
} = require('./lib/github-provider');
const {
  sortDjangoVersions,
  parseClassifiers,
} = require('./lib/pypi-helpers.js');

const serverStartTime = new Date((new Date()).toGMTString());

const camp = require('camp').start({
  documentRoot: path.join(__dirname, 'public'),
  port: config.bind.port,
  hostname: config.bind.address,
  secure: config.ssl.isSecure,
  cert: config.ssl.cert,
  key: config.ssl.key,
});

const githubConstellation = new GithubConstellation({
  persistence: config.persistence,
  service: config.services.github,
});
const { apiProvider: githubApiProvider } = githubConstellation;

function reset() {
  clearRequestCache();
  clearRegularUpdateCache();
}

async function stop() {
  await githubConstellation.stop();
  analytics.cancelAutosaving();
  return new Promise(resolve => {
    camp.close(resolve);
  });
}

module.exports = {
  camp,
  reset,
  stop,
};

log(`Server is starting up: ${config.baseUri}`);

let measurer;
try {
  measurer = new QuickTextMeasurer(config.font.path, config.font.fallbackPath);
} catch (e) {
  console.log(`Unable to load fallback font. Using Helvetica-Bold instead.`);
  measurer = new QuickTextMeasurer('Helvetica');
}
const makeBadge = makeMakeBadgeFn(measurer);
const cache = makeHandleRequestFn(makeBadge);

analytics.load();
analytics.scheduleAutosaving();
analytics.setRoutes(camp);

if (serverSecrets && serverSecrets.shieldsSecret) {
  sysMonitor.setRoutes(camp);
}

githubConstellation.initialize(camp);

suggest.setRoutes(config.cors.allowedOrigin, githubApiProvider, camp);

camp.notfound(/\.(svg|png|gif|jpg|json)/, function(query, match, end, request) {
    var format = match[1];
    var badgeData = getBadgeData("404", query);
    badgeData.text[1] = 'badge not found';
    badgeData.colorscheme = 'red';
    // Add format to badge data.
    badgeData.format = format;
    const svg = makeBadge(badgeData);
    makeSend(format, request.res, end)(svg);
});

camp.notfound(/.*/, function(query, match, end, request) {
  end(null, { template: '404.html' });
});

// Vendors.

loadServiceClasses().forEach(
  serviceClass => serviceClass.register(
    camp,
    cache,
    { handleInternalErrors: config.handleInternalErrors }));

// JIRA issue integration
camp.route(/^\/jira\/issue\/(http(?:s)?)\/(.+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var protocol = match[1];  // eg, https
  var host = match[2];      // eg, issues.apache.org/jira
  var issueKey = match[3];  // eg, KAFKA-2896
  var format = match[4];

  var options = {
    method: 'GET',
    json: true,
    uri: protocol + '://' + host + '/rest/api/2/issue/' +
      encodeURIComponent(issueKey),
  };
  if (serverSecrets && serverSecrets.jira_username) {
    options.auth = {
      user: serverSecrets.jira_username,
      pass: serverSecrets.jira_password,
    };
  }

  // map JIRA color names to closest shields color schemes
  var colorMap = {
    'medium-gray': 'lightgrey',
    'green': 'green',
    'yellow': 'yellow',
    'brown': 'orange',
    'warm-red': 'red',
    'blue-gray': 'blue',
  };

  var badgeData = getBadgeData(issueKey, data);
  request(options, function (err, res, json) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var jiraIssue = json;
      if (jiraIssue.fields && jiraIssue.fields.status) {
        if (jiraIssue.fields.status.name) {
          badgeData.text[1] = jiraIssue.fields.status.name; // e.g. "In Development"
        }
        if (jiraIssue.fields.status.statusCategory) {
          badgeData.colorscheme = colorMap[jiraIssue.fields.status.statusCategory.colorName] || 'lightgrey';
        }
      } else {
        badgeData.text[1] = 'invalid';
      }
      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// JIRA agile sprint completion integration
camp.route(/^\/jira\/sprint\/(http(?:s)?)\/(.+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var protocol  = match[1]; // eg, https
  var host      = match[2]; // eg, jira.spring.io
  var sprintId  = match[3]; // eg, 94
  var format    = match[4]; // eg, png

  var options = {
    method: 'GET',
    json: true,
    uri: protocol + '://' + host + '/rest/api/2/search?jql=sprint='+sprintId+'%20AND%20type%20IN%20(Bug,Improvement,Story,"Technical%20task")&fields=resolution&maxResults=500',
  };
  if (serverSecrets && serverSecrets.jira_username) {
    options.auth = {
      user: serverSecrets.jira_username,
      pass: serverSecrets.jira_password,
    };
  }

  var badgeData = getBadgeData('completion', data);
  request(options, function (err, res, json) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (json && json.total >= 0) {
        var issuesDone = json.issues.filter(function (el) {
          if (el.fields.resolution != null) {
            return el.fields.resolution.name !== "Unresolved";
          }
        }).length;
        badgeData.text[1] = Math.round(issuesDone * 100 / json.total) + "%";
        switch(issuesDone) {
          case 0:
            badgeData.colorscheme = 'red';
            break;
          case json.total:
            badgeData.colorscheme = 'brightgreen';
            break;
          default:
            badgeData.colorscheme = 'orange';
        }
      } else {
        badgeData.text[1] = 'invalid';
      }
      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// PHP version from .travis.yml
camp.route(/^\/travis(?:-ci)?\/php-v\/([^/]+\/[^/]+)(?:\/([^/]+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const userRepo = match[1];  // eg, espadrine/sc
  const version = match[2] || 'master';
  const format = match[3];
  const options = {
    method: 'GET',
    uri: `https://api.travis-ci.org/repos/${userRepo}/branches/${version}`,
  };
  const badgeData = getBadgeData('PHP', data);
  getPhpReleases(githubApiProvider, (err, phpReleases) => {
    if (err != null) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    request(options, (err, res, buffer) => {
      if (err !== null) {
        log.error(`Travis CI error: ${err.stack}`);
        if (res) {
          log.error('' + res);
        }
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
        return;
      }

      try {
        const data = JSON.parse(buffer);
        let travisVersions = [];

        // from php
        if (typeof data.branch.config.php !== 'undefined') {
          travisVersions = travisVersions.concat(data.branch.config.php.map((v) => v.toString()));
        }
        // from matrix
        if (typeof data.branch.config.matrix.include !== 'undefined') {
          travisVersions = travisVersions.concat(data.branch.config.matrix.include.map((v) => v.php.toString()));
        }

        const hasHhvm = travisVersions.find((v) => v.startsWith('hhvm'));
        const versions = travisVersions.map((v) => phpMinorVersion(v)).filter((v) => v.indexOf('.') !== -1);
        let reduction = phpVersionReduction(versions, phpReleases);

        if (hasHhvm) {
          reduction += reduction ? ', ' : '';
          reduction += 'HHVM';
        }

        if (reduction) {
          badgeData.colorscheme = 'blue';
          badgeData.text[1] = reduction;
        } else {
          badgeData.text[1] = 'invalid';
        }
      } catch(e) {
        badgeData.text[1] = 'invalid';
      }
      sendBadge(format, badgeData);
    });
  });
}));

// Travis integration (.org and .com)
camp.route(/^\/travis(-ci)?\/(?:(com)\/)?([^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const travisDomain = match[2] || 'org';  // (com | org) org by default
  const userRepo = match[3];  // eg, espadrine/sc
  const branch = match[4];
  const format = match[5];
  const options = {
    method: 'HEAD',
    uri: `https://api.travis-ci.${travisDomain}/${userRepo}.svg`,
  };
  if (branch != null) {
    options.uri += `?branch=${branch}`;
  }
  const badgeData = getBadgeData('build', data);
  request(options, function(err, res) {
    if (err != null) {
      log.error('Travis error: data:' + JSON.stringify(data) +
        '\nStack: ' + err.stack);
      if (res) { log.error(''+res); }
    }
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const state = res.headers['content-disposition']
                     .match(/filename="(.+)\.svg"/)[1];
      badgeData.text[1] = state;
      if (state === 'passing') {
        badgeData.colorscheme = 'brightgreen';
      } else if (state === 'failing') {
        badgeData.colorscheme = 'red';
      } else {
        badgeData.text[1] = state;
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// continuousphp integration
camp.route(/^\/continuousphp\/([^/]+)\/([^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var provider = match[1];
  var userRepo = match[2];
  var branch   = match[3];
  var format   = match[4];

  var options = {
    method: 'GET',
    uri: 'https://status.continuousphp.com/' + provider + '/' + userRepo + '/status-info',
    headers: {
      'Accept': 'application/json',
    },
  };

  if (branch != null) {
    options.uri += '?branch=' + branch;
  }

  var badgeData = getBadgeData('build', data);
  request(options, function(err, res) {
    if (err != null) {
      console.error('continuousphp error: ' + err.stack);
      if (res) {
        console.error('' + res);
      }

      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }

    try {
      var status = JSON.parse(res['body']).status;

      badgeData.text[1] = status;

      if (status === 'passing') {
        badgeData.colorscheme = 'brightgreen';
      } else if (status === 'failing') {
        badgeData.colorscheme = 'red';
      } else if (status === 'unstable') {
        badgeData.colorscheme = 'yellow';
      } else if (status === 'running') {
        badgeData.colorscheme = 'blue';
      } else if (status === 'unknown') {
        badgeData.colorscheme = 'lightgrey';
      } else {
        badgeData.text[1] = status;
      }

      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// NetflixOSS metadata integration
camp.route(/^\/osslifecycle?\/([^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
  cache(function(data, match, sendBadge, request) {
    var orgOrUserAndRepo = match[1];
    var branch = match[2];
    var format = match[3];
    var url = 'https://raw.githubusercontent.com/' + orgOrUserAndRepo;
    if (branch != null) {
      url += "/" + branch + "/OSSMETADATA";
    }
    else {
      url += "/master/OSSMETADATA";
    }
    var options = {
      method: 'GET',
      uri: url,
    };
    var badgeData = getBadgeData('OSS Lifecycle', data);
    request(options, function(err, res, body) {
      if (err != null) {
        log.error('NetflixOSS error: ' + err.stack);
        if (res) { log.error(''+res); }
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
        return;
      }
      try {
        var matchStatus = body.match(/osslifecycle=([a-z]+)/im);
        if (matchStatus === null) {
          badgeData.text[1] = 'inaccessible';
          sendBadge(format, badgeData);
          return;
        } else {
          badgeData.text[1] = matchStatus[1];
          sendBadge(format, badgeData);
          return;
        }
      } catch(e) {
        log(e);
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
      }
    });
}));

// Shippable integration
camp.route(/^\/shippable\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {

  // source: https://github.com/badges/shields/pull/1362#discussion_r161693830
  const statusCodes = {
    0:  { color: '#5183A0', label: "waiting" },
    10: { color: '#5183A0', label: "queued" },
    20: { color: '#5183A0', label: "processing" },
    30: { color: '#44CC11', label: "success" },
    40: { color: '#F8A97D', label: "skipped" },
    50: { color: '#CEA61B', label: "unstable" },
    60: { color: '#555555', label: "timeout" },
    70: { color: '#6BAFBD', label: "cancelled" },
    80: { color: '#DC5F59', label: "failed" },
    90: { color: '#555555', label: "stopped" },
  };

  const project = match[1];  // eg, 54d119db5ab6cc13528ab183
  let targetBranch = match[2];
  if (targetBranch == null) {
    targetBranch = 'master';
  }
  const format = match[3];
  const url = 'https://api.shippable.com/projects/' + project + '/branchRunStatus';
  const options = {
    method: 'GET',
    uri: url,
  };

  const badgeData = getBadgeData('build', data);

  request(options, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      res = JSON.parse(buffer);
      for (const branch of res) {
        if (branch.branchName === targetBranch) {
          badgeData.text[1] = statusCodes[branch.statusCode].label;
          badgeData.colorB = statusCodes[branch.statusCode].color;
          sendBadge(format, badgeData);
          return;
        }
      }
      badgeData.text[1] = 'branch not found';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Rust download and version integration
camp.route(/^\/crates\/(d|v|dv|l)\/([A-Za-z0-9_-]+)(?:\/([0-9.]+))?\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var mode = match[1];  // d - downloads (total or for version), v - (latest) version, dv - downloads (for latest version)
  var crate = match[2];  // crate name, e.g. rustc-serialize
  var version = match[3];  // crate version in semver format, optional, e.g. 0.1.2
  var format = match[4];
  var modes = {
    'd': {
      name: 'downloads',
      version: true,
      process: function (data, badgeData) {
        var downloads = data.crate? data.crate.downloads: data.version.downloads;
        version = data.version && data.version.num;
        badgeData.text[1] = metric(downloads) + (version? ' version ' + version: '');
        badgeData.colorscheme = downloadCountColor(downloads);
      },
    },
    'dv': {
      name: 'downloads',
      version: true,
      process: function (data, badgeData) {
        var downloads = data.version? data.version.downloads: data.versions[0].downloads;
        version = data.version && data.version.num;
        badgeData.text[1] = metric(downloads) + (version? ' version ' + version: ' latest version');
        badgeData.colorscheme = downloadCountColor(downloads);
      },
    },
    'v': {
      name: 'crates.io',
      version: true,
      process: function (data, badgeData) {
        version = data.version? data.version.num: data.crate.max_version;
        badgeData.text[1] = versionText(version);
        badgeData.colorscheme = versionColor(version);
      },
    },
    'l': {
      name: 'license',
      version: false,
      process: function (data, badgeData) {
        badgeData.text[1] = data.versions[0].license;
        badgeData.colorscheme = 'blue';
      },
    },
  };
  var behavior = modes[mode];
  var apiUrl = 'https://crates.io/api/v1/crates/' + crate;
  if (version != null && behavior.version) {
    apiUrl += '/' + version;
  }

  var badgeData = getBadgeData(behavior.name, data);
  request(apiUrl, { headers: { 'Accept': 'application/json' } }, function (err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      behavior.process(data, badgeData);
      sendBadge(format, badgeData);

    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Old url for CodeBetter TeamCity instance.
camp.route(/^\/teamcity\/codebetter\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var buildType = match[1];  // eg, `bt428`.
  var format = match[2];
  teamcityBadge('http://teamcity.codebetter.com', buildType, false, format, data, sendBadge, request);
}));

// Generic TeamCity instance
camp.route(/^\/teamcity\/(http|https)\/(.*)\/(s|e)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[1];
  var serverUrl = match[2];
  var advanced = (match[3] == 'e');
  var buildType = match[4];  // eg, `bt428`.
  var format = match[5];
  teamcityBadge(scheme + '://' + serverUrl, buildType, advanced, format, data, sendBadge, request);
}));

// TeamCity CodeBetter code coverage
camp.route(/^\/teamcity\/coverage\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var buildType = match[1];  // eg, `bt428`.
  var format = match[2];
  var apiUrl = 'http://teamcity.codebetter.com/app/rest/builds/buildType:(id:' + buildType + ')/statistics?guest=1';
  var badgeData = getBadgeData('coverage', data);
  request(apiUrl, { headers: { 'Accept': 'application/json' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var covered;
      var total;

      data.property.forEach(function(property) {
        if (property.name === 'CodeCoverageAbsSCovered') {
          covered = property.value;
        } else if (property.name === 'CodeCoverageAbsSTotal') {
          total = property.value;
        }
      });

      if (covered === undefined || total === undefined) {
        badgeData.text[1] = 'malformed';
        sendBadge(format, badgeData);
        return;
      }

      var percentage = covered / total * 100;
      badgeData.text[1] = percentage.toFixed(0) + '%';
      badgeData.colorscheme = coveragePercentageColor(percentage);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// SonarQube code coverage
camp.route(/^\/sonar\/?([0-9.]+)?\/(http|https)\/(.*)\/(.*)\/(.*)\.(svg|png|gif|jpg|json)$/,
    cache(function(data, match, sendBadge, request) {
      var version = parseFloat(match[1]);
      var scheme = match[2];
      var serverUrl = match[3];
      var buildType = match[4];
      var metricName = match[5];
      var format = match[6];

      var sonarMetricName = metricName;
      if (metricName === 'tech_debt') {
        //special condition for backwards compatibility
        sonarMetricName = 'sqale_debt_ratio';
      }

      const useLegacyApi = !!version && version < 5.4;

      var uri = useLegacyApi ?
          scheme + '://' + serverUrl + '/api/resources?resource=' + buildType + '&depth=0&metrics=' + encodeURIComponent(sonarMetricName) + '&includetrends=true':
          scheme + '://' + serverUrl + '/api/measures/component?componentKey=' + buildType + '&metricKeys=' + encodeURIComponent(sonarMetricName);

      var options = {
        uri,
        headers: {
          Accept: 'application/json',
        },
      };
      if (serverSecrets && serverSecrets.sonarqube_token) {
        options.auth = {
          user: serverSecrets.sonarqube_token,
        };
      }

      var badgeData = getBadgeData(metricName.replace(/_/g, ' '), data);

      request(options, function(err, res, buffer) {
        if (err != null) {
          badgeData.text[1] = 'inaccessible';
          sendBadge(format, badgeData);
          return;
        }
        try {
          var data = JSON.parse(buffer);

          var value =  parseInt(useLegacyApi ? data[0].msr[0].val : data.component.measures[0].value);

          if (value === undefined) {
            badgeData.text[1] = 'unknown';
            sendBadge(format, badgeData);
            return;
          }

          if (metricName.indexOf('coverage') !== -1) {
            badgeData.text[1] = value.toFixed(0) + '%';
            badgeData.colorscheme = coveragePercentageColor(value);
          } else if (/^\w+_violations$/.test(metricName)) {
            badgeData.text[1] = value;
            badgeData.colorscheme = 'brightgreen';
            if (value > 0) {
              if (metricName === 'blocker_violations') {
                badgeData.colorscheme = 'red';
              } else if (metricName === 'critical_violations') {
                badgeData.colorscheme = 'orange';
              } else if (metricName === 'major_violations') {
                badgeData.colorscheme = 'yellow';
              } else if (metricName === 'minor_violations') {
                badgeData.colorscheme = 'yellowgreen';
              } else if (metricName === 'info_violations') {
                badgeData.colorscheme = 'green';
              }
            }

          } else if (metricName === 'fortify-security-rating') {
            badgeData.text[1] = value + '/5';

            if (value === 0) {
              badgeData.colorscheme = 'red';
            } else if (value === 1) {
              badgeData.colorscheme = 'orange';
            } else if (value === 2) {
              badgeData.colorscheme = 'yellow';
            } else if (value === 3) {
              badgeData.colorscheme = 'yellowgreen';
            } else if (value === 4) {
              badgeData.colorscheme = 'green';
            } else if (value === 5) {
              badgeData.colorscheme = 'brightgreen';
            } else {
              badgeData.colorscheme = 'lightgrey';
            }
          } else if (metricName === 'sqale_debt_ratio' || metricName === 'tech_debt' || metricName === 'public_documented_api_density') {
            // colors are based on sonarqube default rating grid and display colors
            // [0,0.1)   ==> A (green)
            // [0.1,0.2) ==> B (yellowgreen)
            // [0.2,0.5) ==> C (yellow)
            // [0.5,1)   ==> D (orange)
            // [1,)      ==> E (red)
            var colorValue = value;
            if (metricName === 'public_documented_api_density'){
              //Some metrics higher % is better
              colorValue = 100 - value;
            }
            badgeData.text[1] = value + '%';
            if (colorValue >= 100) {
              badgeData.colorscheme = 'red';
            } else if (colorValue >= 50) {
              badgeData.colorscheme = 'orange';
            } else if (colorValue >= 20) {
              badgeData.colorscheme = 'yellow';
            } else if (colorValue >= 10) {
              badgeData.colorscheme = 'yellowgreen';
            } else if (colorValue >= 0) {
              badgeData.colorscheme = 'brightgreen';
            } else {
              badgeData.colorscheme = 'lightgrey';
            }
          } else {
            badgeData.text[1] = metric(value);
            badgeData.colorscheme = 'brightgreen';
          }
          sendBadge(format, badgeData);
        } catch(e) {
          badgeData.text[1] = 'invalid';
          sendBadge(format, badgeData);
        }
      });
    }));

// Coverity integration
camp.route(/^\/coverity\/scan\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectId = match[1]; // eg, `3997`
  var format = match[2];
  var url = 'https://scan.coverity.com/projects/' + projectId + '/badge.json';
  var badgeData = getBadgeData('coverity', data);
  request(url, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      badgeData.text[1] = data.message;

      if (data.message === 'passed') {
        badgeData.colorscheme = 'brightgreen';
        badgeData.text[1] = 'passing';
      } else if (/^passed .* new defects$/.test(data.message)) {
        badgeData.colorscheme = 'yellow';
      } else if (data.message === 'pending') {
        badgeData.colorscheme = 'orange';
      } else if (data.message === 'failed') {
        badgeData.colorscheme = 'red';
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Coverity Code Advisor On Demand integration
camp.route(/^\/coverity\/ondemand\/(.+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var badgeType = match[1];     // One of the strings "streams" or "jobs"
  var badgeTypeId = match[2];   // streamId or jobId
  var format = match[3];

  var badgeData = getBadgeData('coverity', data);
  if ((badgeType == 'jobs' && badgeTypeId == 'JOB') ||
      (badgeType == 'streams' && badgeTypeId == 'STREAM')) {
     // Request is for a static demo badge
     badgeData.text[1] = 'clean';
     badgeData.colorscheme = 'green';
     sendBadge(format, badgeData);
     return;
  } else {
    //
    // Request is for a real badge; send request to Coverity On Demand API
    // server to get the badge
    //
    // Example URLs for requests sent to Coverity On Demand are:
    //
    // https://api.ondemand.coverity.com/streams/44b25sjc9l3ntc2ngfi29tngro/badge
    // https://api.ondemand.coverity.com/jobs/p4tmm8031t4i971r0im4s7lckk/badge
    //

    var url = 'https://api.ondemand.coverity.com/' +
        badgeType + '/' + badgeTypeId + '/badge';
    request(url, function(err, res, buffer) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      try {
        var data = JSON.parse(buffer);
        sendBadge(format, data);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  }
}));

// LGTM alerts integration
camp.route(/^\/lgtm\/alerts\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const projectId = match[1]; // eg, `g/apache/cloudstack`
  const format = match[2];
  const url = 'https://lgtm.com/api/v0.1/project/' + projectId + '/details';
  const badgeData = getBadgeData('lgtm', data);
  request(url, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res, { 404: 'project not found' })) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const data = JSON.parse(buffer);
      if (!('alerts' in data))
        throw new Error("Invalid data");
      badgeData.text[1] = metric(data.alerts) + (data.alerts === 1 ? ' alert' : ' alerts');

      if (data.alerts === 0) {
        badgeData.colorscheme = 'brightgreen';
      } else {
        badgeData.colorscheme = 'yellow';
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// LGTM grades integration
camp.route(/^\/lgtm\/grade\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const language = match[1]; // eg, `java`
  const projectId = match[2]; // eg, `g/apache/cloudstack`
  const format = match[3];
  const url = 'https://lgtm.com/api/v0.1/project/' + projectId + '/details';
  const languageLabel = (() => {
    switch(language) {
      case 'cpp':
        return 'c/c++';
      case 'csharp':
        return 'c#';
      // Javascript analysis on LGTM also includes TypeScript
      case 'javascript':
        return 'js/ts';
      default:
        return language;
    }
  })();
  const badgeData = getBadgeData('code quality: ' + languageLabel, data);
  request(url, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res, { 404: 'project not found' })) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const data = JSON.parse(buffer);
      if (!('languages' in data))
        throw new Error("Invalid data");
      for (const languageData of data.languages) {
        if (languageData.lang === language && 'grade' in languageData) {
          // Pretty label for the language
          badgeData.text[1] = languageData.grade;
          // Pick colour based on grade
          if (languageData.grade === 'A+') {
            badgeData.colorscheme = 'brightgreen';
          } else if (languageData.grade === 'A') {
            badgeData.colorscheme = 'green';
          } else if (languageData.grade === 'B') {
            badgeData.colorscheme = 'yellowgreen';
          } else if (languageData.grade === 'C') {
            badgeData.colorscheme = 'yellow';
          } else if (languageData.grade === 'D') {
            badgeData.colorscheme = 'orange';
          } else {
            badgeData.colorscheme = 'red';
          }
        sendBadge(format, badgeData);
        return;
        }
      }
      badgeData.text[1] = 'no data for language';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Gratipay integration.
camp.route(/^\/(?:gittip|gratipay(\/user|\/team|\/project)?)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(queryParams, match, sendBadge, request) {
  const format = match[3];
  const badgeData = getDeprecatedBadge('gratipay', queryParams);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('gratipay', queryParams);
  }
  sendBadge(format, badgeData);
}));

// Liberapay integration.
camp.route(/^\/liberapay\/(receives|gives|patrons|goal)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];  // e.g., 'gives'
  var entity = match[2]; // e.g., 'Changaco'
  var format = match[3];
  var apiUrl = 'https://liberapay.com/' + entity + '/public.json';
  // Lock down type
  const label = {
      'receives': 'receives',
      'gives': 'gives',
      'patrons': 'patrons',
      'goal': 'goal progress',
      }[type];
  const badgeData = getBadgeData(label, data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('liberapay', data);
  }
  request(apiUrl, function dealWithData(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var value;
      var currency;
      switch(type) {
        case 'receives':
            if (data.receiving) {
                value = data.receiving.amount;
                currency = data.receiving.currency;
                badgeData.text[1] = `${metric(value)} ${currency}/week`;
                }
            break;
        case 'gives':
            if (data.giving) {
                value = data.giving.amount;
                currency = data.giving.currency;
                badgeData.text[1] = `${metric(value)} ${currency}/week`;
                }
            break;
        case 'patrons':
            value = data.npatrons;
            badgeData.text[1] = metric(value);
            break;
        case 'goal':
            if (data.goal) {
                value = Math.round(data.receiving.amount/data.goal.amount*100);
                badgeData.text[1] = `${value}%`;
                }
            break;
        }
      if (value != null) {
        badgeData.colorscheme = colorScale([0, 10, 100])(value);
        sendBadge(format, badgeData);
      } else {
        badgeData.text[1] = 'anonymous';
        badgeData.colorscheme = 'blue';
        sendBadge(format, badgeData);
      }
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Libscore integration.
camp.route(/^\/libscore\/s\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var library = match[1];  // eg, `jQuery`.
  var format = match[2];
  var apiUrl = 'http://api.libscore.com/v1/libraries/' + library;
  var badgeData = getBadgeData('libscore', data);
  request(apiUrl, function dealWithData(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (data.count.length === 0) {
        /* Note the 'not found' response from libscore is:
           status code = 200,
           body = {"github":"","meta":{},"count":[],"sites":[]}
        */
        badgeData.text[1] = 'not found';
        sendBadge(format, badgeData);
        return;
      }
      badgeData.text[1] = metric(+data.count[data.count.length-1]);
      badgeData.colorscheme = 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Codetally integration.
camp.route(/^\/codetally\/(.*)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var owner = match[1];  // eg, triggerman722.
  var repo = match[2];   // eg, colorstrap
  var format = match[3];
  var apiUrl = 'http://www.codetally.com/formattedshield/' + owner + '/' + repo;
  var badgeData = getBadgeData('codetally', data);
  request(apiUrl, function dealWithData(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      badgeData.text[1] = " " + data.currency_sign + data.amount + " " + data.multiplier;
      badgeData.colorscheme = null;
      badgeData.colorB = '#2E8B57';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));


// Bountysource integration.
camp.route(/^\/bountysource\/team\/([^/]+)\/activity\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const team = match[1];  // eg, `mozilla-core`.
  const format = match[2];
  const url = 'https://api.bountysource.com/teams/' + team;
  const options = {
    headers: { 'Accept': 'application/vnd.bountysource+json; version=2' } };
  let badgeData = getBadgeData('bounties', data);
  request(url, options, function dealWithData(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (res.statusCode !== 200) {
        throw Error('Bad response.');
      }
      const parsedData = JSON.parse(buffer);
      const activity = parsedData.activity_total;
      badgeData.colorscheme = 'brightgreen';
      badgeData.text[1] = activity;
      sendBadge(format, badgeData);
    } catch(e) {
      if (res.statusCode === 404) {
        badgeData.text[1] = 'not found';
      } else {
        badgeData.text[1] = 'invalid';
      }
      sendBadge(format, badgeData);
    }
  });
}));

// HHVM integration.
camp.route(/^\/hhvm\/([^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const user = match[1];  // eg, `symfony/symfony`.
  let branch = match[2]
    ? omitv(match[2])
    : 'dev-master';
  const format = match[3];
  const apiUrl = 'https://php-eye.com/api/v1/package/'+user+'.json';
  let badgeData = getBadgeData('hhvm', data);
  if (branch === 'master') {
    branch = 'dev-master';
  }
  request(apiUrl, function dealWithData(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res, { 404: 'repo not found' })) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      let data = JSON.parse(buffer);
      let verInfo = {};
      if (!data.versions) {
        throw Error('Unexpected response.');
      }
      badgeData.text[1] = 'branch not found';
      for (let i = 0, count = data.versions.length; i < count; i++) {
        verInfo = data.versions[i];
        if (verInfo.name === branch) {
          if (!verInfo.travis.runtime_status) {
            throw Error('Unexpected response.');
          }
          switch (verInfo.travis.runtime_status.hhvm) {
            case 3:
              // tested`
              badgeData.colorscheme = 'brightgreen';
              badgeData.text[1] = 'tested';
              break;
            case 2:
              // allowed failure
              badgeData.colorscheme = 'yellow';
              badgeData.text[1] = 'partially tested';
              break;
            case 1:
              // not tested
              badgeData.colorscheme = 'red';
              badgeData.text[1] = 'not tested';
              break;
            case 0:
              // unknown/no config file
              badgeData.text[1] = 'maybe untested';
              break;
          }
          break;
        }
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// SensioLabs.
camp.route(/^\/sensiolabs\/i\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectUuid = match[1];
  var format = match[2];
  var options = {
    method: 'GET',
    uri: 'https://insight.sensiolabs.com/api/projects/' + projectUuid,
    headers: {
      Accept: 'application/vnd.com.sensiolabs.insight+xml',
    },
  };

  if (serverSecrets && serverSecrets.sl_insight_userUuid) {
    options.auth = {
      user: serverSecrets.sl_insight_userUuid,
      pass: serverSecrets.sl_insight_apiToken,
    };
  }

  var badgeData = getBadgeData('check', data);

  request(options, function(err, res, body) {
    if (err != null || res.statusCode !== 200) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    var matchStatus = body.match(/<status><!\[CDATA\[([a-z]+)\]\]><\/status>/im);
    var matchGrade = body.match(/<grade><!\[CDATA\[([a-z]+)\]\]><\/grade>/im);

    if (matchStatus === null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    } else if (matchStatus[1] !== 'finished') {
      badgeData.text[1] = 'pending';
      sendBadge(format, badgeData);
      return;
    } else if (matchGrade === null) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }

    if (matchGrade[1] === 'platinum') {
      badgeData.text[1] = 'platinum';
      badgeData.colorscheme = 'brightgreen';
    } else if (matchGrade[1] === 'gold') {
      badgeData.text[1] = 'gold';
      badgeData.colorscheme = 'yellow';
    } else if (matchGrade[1] === 'silver') {
      badgeData.text[1] = 'silver';
      badgeData.colorscheme = 'lightgrey';
    } else if (matchGrade[1] === 'bronze') {
      badgeData.text[1] = 'bronze';
      badgeData.colorscheme = 'orange';
    } else if (matchGrade[1] === 'none') {
      badgeData.text[1] = 'no medal';
      badgeData.colorscheme = 'red';
    } else {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }

    sendBadge(format, badgeData);
    return;
  });
}));

// Packagist integration.
camp.route(/^\/packagist\/(dm|dd|dt)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];  // either `dm` or dt`.
  var userRepo = match[2];  // eg, `doctrine/orm`.
  var format = match[3];
  var apiUrl = 'https://packagist.org/packages/' + userRepo + '.json';
  var badgeData = getBadgeData('downloads', data);
  if (userRepo.substr(-14) === '/:package_name') {
    badgeData.text[1] = 'invalid';
    return sendBadge(format, badgeData);
  }
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var downloads;
      switch (info.charAt(1)) {
      case 'm':
        downloads = data.package.downloads.monthly;
        badgeData.text[1] = metric(downloads) + '/month';
        break;
      case 'd':
        downloads = data.package.downloads.daily;
        badgeData.text[1] = metric(downloads) + '/day';
        break;
      case 't':
        downloads = data.package.downloads.total;
        badgeData.text[1] = metric(downloads);
        break;
      }
      badgeData.colorscheme = downloadCountColor(downloads);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Packagist version integration.
camp.route(/^\/packagist\/(v|vpre)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];  // either `v` or `vpre`.
  var userRepo = match[2];  // eg, `doctrine/orm`.
  var format = match[3];
  var apiUrl = 'https://packagist.org/packages/' + userRepo + '.json';
  var badgeData = getBadgeData('packagist', data);
  if (userRepo.substr(-14) === '/:package_name') {
    badgeData.text[1] = 'invalid';
    return sendBadge(format, badgeData);
  }
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);

      var versionsData = data.package.versions;
      var versions = Object.keys(versionsData);

      // Map aliases (eg, dev-master).
      var aliasesMap = {};
      versions.forEach(function(version) {
        var versionData = versionsData[version];
        if (versionData.extra && versionData.extra['branch-alias'] &&
            versionData.extra['branch-alias'][version]) {
          // eg, version is 'dev-master', mapped to '2.0.x-dev'.
          var validVersion = versionData.extra['branch-alias'][version];
          if (aliasesMap[validVersion] === undefined ||
              phpVersionCompare(aliasesMap[validVersion], validVersion) < 0) {
            versions.push(validVersion);
            aliasesMap[validVersion] = version;
          }
        }
      });
      versions = versions.filter(function(version) {
        return !(/^dev-/.test(version));
      });

      var badgeText = null;
      var badgeColor = null;

      switch (info) {
      case 'v':
        var stableVersions = versions.filter(phpStableVersion);
        var stableVersion = phpLatestVersion(stableVersions);
        if (!stableVersion) {
          stableVersion = phpLatestVersion(versions);
        }
        //if (!!aliasesMap[stableVersion]) {
        //  stableVersion = aliasesMap[stableVersion];
        //}
        badgeText = versionText(stableVersion);
        badgeColor = versionColor(stableVersion);
        break;
      case 'vpre':
        var unstableVersion = phpLatestVersion(versions);
        //if (!!aliasesMap[unstableVersion]) {
        //  unstableVersion = aliasesMap[unstableVersion];
        //}
        badgeText = versionText(unstableVersion);
        badgeColor = 'orange';
        break;
      }

      if (badgeText !== null) {
        badgeData.text[1] = badgeText;
        badgeData.colorscheme = badgeColor;
      }

      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Packagist license integration.
camp.route(/^\/packagist\/l\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];
  var format = match[2];
  var apiUrl = 'https://packagist.org/packages/' + userRepo + '.json';
  var badgeData = getBadgeData('license', data);
  if (userRepo.substr(-14) === '/:package_name') {
    badgeData.text[1] = 'invalid';
    return sendBadge(format, badgeData);
  }
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      // Note: if you change the latest version detection algorithm here,
      // change it above (for the actual version badge).
      var version;
      var unstable = function(ver) { return /dev/.test(ver); };
      // Grab the latest stable version, or an unstable
      for (var versionName in data.package.versions) {
        var current = data.package.versions[versionName];

        if (version !== undefined) {
          if (unstable(version.version) && !unstable(current.version)) {
            version = current;
          } else if (version.version_normalized < current.version_normalized) {
            version = current;
          }
        } else {
          version = current;
        }
      }
      badgeData.text[1] = version.license[0];
      badgeData.colorscheme = 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Package Control integration.
camp.route(/^\/packagecontrol\/(dm|dw|dd|dt)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];  // either `dm`, `dw`, `dd` or dt`.
  var userRepo = match[2];  // eg, `Package%20Control`.
  var format = match[3];
  var apiUrl = 'https://packagecontrol.io/packages/' + userRepo + '.json';
  var badgeData = getBadgeData('downloads', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var downloads = 0;
      var platforms;
      switch (info.charAt(1)) {
      case 'm':
        // daily downloads are separated by Operating System
        platforms = data.installs.daily.data;
        platforms.forEach(function(platform) {
          // loop through the first 30 days or 1 month
          for (var i = 0; i < 30; i++) {
            // add the downloads for that day for that platform
            downloads += platform.totals[i];
          }
        });
        badgeData.text[1] = metric(downloads) + '/month';
        break;
      case 'w':
        // daily downloads are separated by Operating System
        platforms = data.installs.daily.data;
        platforms.forEach(function(platform) {
          // loop through the first 7 days or 1 week
          for (var i = 0; i < 7; i++) {
            // add the downloads for that day for that platform
            downloads += platform.totals[i];
          }
        });
        badgeData.text[1] = metric(downloads) + '/week';
        break;
      case 'd':
        // daily downloads are separated by Operating System
        platforms = data.installs.daily.data;
        platforms.forEach(function(platform) {
          // use the downloads from yesterday
          downloads += platform.totals[1];
        });
        badgeData.text[1] = metric(downloads) + '/day';
        break;
      case 't':
        // all-time downloads are already compiled
        downloads = data.installs.total;
        badgeData.text[1] = metric(downloads);
        break;
      }
      badgeData.colorscheme = downloadCountColor(downloads);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Anaconda Cloud / conda package manager integration
camp.route(/^\/conda\/([dvp]n?)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(queryData, match, sendBadge, request) {
  const mode = match[1];
  const channel = match[2];
  const pkgname = match[3];
  const format = match[4];
  const url = 'https://api.anaconda.org/package/' + channel + '/' + pkgname;
  const labels = {
    'd': 'downloads',
    'p': 'platform',
    'v': channel,
  };
  const modes = {
    // downloads - 'd'
    'd': function(data, badgeData) {
      const downloads = data.files.reduce((total, file) => total + file.ndownloads, 0);
      badgeData.text[1] = metric(downloads);
      badgeData.colorscheme = downloadCountColor(downloads);
    },
    // latest version 'v'
    'v': function(data, badgeData) {
      const version = data.latest_version;
      badgeData.text[1] = versionText(version);
      badgeData.colorscheme = versionColor(version);
    },
    // platform 'p'
    'p': function(data, badgeData) {
      const platforms = data.conda_platforms.join(' | ');
      badgeData.text[1] = platforms;
    },
  };
  const variants = {
    // default use `conda|{channelname}` as label
    '': function(queryData, badgeData) {
      badgeData.text[0] = getLabel(`conda|${badgeData.text[0]}`, queryData);
    },
    // skip `conda|` prefix
    'n': function(queryData, badgeData) {
    },
  };

  const update = modes[mode.charAt(0)];
  const variant = variants[mode.charAt(1)];

  var badgeData = getBadgeData(labels[mode.charAt(0)], queryData);
  request(url, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      variant(queryData, badgeData);
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      update(data, badgeData);
      variant(queryData, badgeData);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      variant(queryData, badgeData);
      sendBadge(format, badgeData);
    }
  });
}));

// Bintray version integration
camp.route(/^\/bintray\/v\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var path = match[1]; // :subject/:repo/:package (e.g. asciidoctor/maven/asciidoctorj)
  var format = match[2];

  var options = {
    method: 'GET',
    uri: 'https://bintray.com/api/v1/packages/' + path + '/versions/_latest',
    headers: {
      Accept: 'application/json',
    },
  };

  if (serverSecrets && serverSecrets.bintray_user) {
    options.auth = {
      user: serverSecrets.bintray_user,
      pass: serverSecrets.bintray_apikey,
    };
  }

  var badgeData = getBadgeData('bintray', data);
  request(options, function(err, res, buffer) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      badgeData.text[1] = versionText(data.name);
      badgeData.colorscheme = versionColor(data.name);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// iTunes App Store version
camp.route(/^\/itunes\/v\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var bundleId = match[1];  // eg, `324684580`
  var format = match[2];
  var apiUrl = 'https://itunes.apple.com/lookup?id=' + bundleId;
  var badgeData = getBadgeData('itunes app store', data);
  request(apiUrl, function(err, res, buffer) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (data.resultCount === 0) {
        /* Note the 'not found' response from iTunes is:
           status code = 200,
           body = { "resultCount":0, "results": [] }
        */
        badgeData.text[1] = 'not found';
        sendBadge(format, badgeData);
        return;
      }
      var version = data.results[0].version;
      badgeData.text[1] = versionText(version);
      badgeData.colorscheme = versionColor(version);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// PyPI integration.
camp.route(/^\/pypi\/([^/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];
  var egg = match[2];  // eg, `gevent`, `Django`.
  var format = match[3];
  var apiUrl = 'https://pypi.org/pypi/' + egg + '/json';
  var badgeData = getBadgeData('pypi', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var parsedData = JSON.parse(buffer);
      if (info === 'dm' || info === 'dw' || info ==='dd') {
        // See #716 for the details of the loss of service.
        badgeData.text[0] = getLabel('downloads', data);
        badgeData.text[1] = 'no longer available';
        //var downloads;
        //switch (info.charAt(1)) {
        //  case 'm':
        //    downloads = data.info.downloads.last_month;
        //    badgeData.text[1] = metric(downloads) + '/month';
        //    break;
        //  case 'w':
        //    downloads = parsedData.info.downloads.last_week;
        //    badgeData.text[1] = metric(downloads) + '/week';
        //    break;
        //  case 'd':
        //    downloads = parsedData.info.downloads.last_day;
        //    badgeData.text[1] = metric(downloads) + '/day';
        //    break;
        //}
        //badgeData.colorscheme = downloadCountColor(downloads);
        sendBadge(format, badgeData);
      } else if (info === 'v') {
        var version = parsedData.info.version;
        badgeData.text[1] = versionText(version);
        badgeData.colorscheme = versionColor(version);
        sendBadge(format, badgeData);
      } else if (info === 'l') {
        var license = parsedData.info.license;
        badgeData.text[0] = getLabel('license', data);
        if (license === null || license === 'UNKNOWN') {
          badgeData.text[1] = 'Unknown';
        } else {
          badgeData.text[1] = license;
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      } else if (info === 'wheel') {
        let releases = parsedData.releases[parsedData.info.version];
        let hasWheel = false;
        for (let i = 0; i < releases.length; i++) {
          if (releases[i].packagetype === 'wheel' ||
              releases[i].packagetype === 'bdist_wheel') {
            hasWheel = true;
            break;
          }
        }
        badgeData.text[0] = getLabel('wheel', data);
        badgeData.text[1] = hasWheel ? 'yes' : 'no';
        badgeData.colorscheme = hasWheel ? 'brightgreen' : 'red';
        sendBadge(format, badgeData);
      } else if (info === 'format') {
        let releases = parsedData.releases[parsedData.info.version];
        let hasWheel = false;
        var hasEgg = false;
        for (var i = 0; i < releases.length; i++) {
          if (releases[i].packagetype === 'wheel' ||
              releases[i].packagetype === 'bdist_wheel') {
            hasWheel = true;
            break;
          }
          if (releases[i].packagetype === 'egg' ||
              releases[i].packagetype === 'bdist_egg') {
            hasEgg = true;
          }
        }
        badgeData.text[0] = getLabel('format', data);
        if (hasWheel) {
          badgeData.text[1] = 'wheel';
          badgeData.colorscheme = 'brightgreen';
        } else if (hasEgg) {
          badgeData.text[1] = 'egg';
          badgeData.colorscheme = 'red';
        } else {
          badgeData.text[1] = 'source';
          badgeData.colorscheme = 'yellow';
        }
        sendBadge(format, badgeData);
      } else if (info === 'pyversions') {
        let versions = parseClassifiers(
          parsedData,
          /^Programming Language :: Python :: ([\d.]+)$/
        );

        // We only show v2 if eg. v2.4 does not appear.
        // See https://github.com/badges/shields/pull/489 for more.
        ['2', '3'].forEach(function(version) {
          var hasSubVersion = function(v) { return v.indexOf(version + '.') === 0; };
          if (versions.some(hasSubVersion)) {
            versions = versions.filter(function(v) { return v !== version; });
          }
        });
        if (!versions.length) {
          versions.push('not found');
        }
        badgeData.text[0] = getLabel('python', data);
        badgeData.text[1] = versions.sort().join(', ');
        badgeData.colorscheme = 'blue';
        sendBadge(format, badgeData);
      } else if (info === 'djversions') {
        let versions = parseClassifiers(
          parsedData,
          /^Framework :: Django :: ([\d.]+)$/
        );

        if (!versions.length) {
          versions.push('not found');
        }

        // sort low to high
        versions = sortDjangoVersions(versions);

        badgeData.text[0] = getLabel('django versions', data);
        badgeData.text[1] = versions.join(', ');
        badgeData.colorscheme = 'blue';
        sendBadge(format, badgeData);
      } else if (info === 'implementation') {
        let implementations = parseClassifiers(
          parsedData,
          /^Programming Language :: Python :: Implementation :: (\S+)$/
        );

        if (!implementations.length) {
          implementations.push('cpython');  // assume CPython
        }
        badgeData.text[0] = getLabel('implementation', data);
        badgeData.text[1] = implementations.sort().join(', ');
        badgeData.colorscheme = 'blue';
        sendBadge(format, badgeData);
      } else if (info === 'status') {
        let pattern = /^Development Status :: ([1-7]) - (\S+)$/;
        var statusColors = {
            '1': 'red', '2': 'red', '3': 'red', '4': 'yellow',
            '5': 'brightgreen', '6': 'brightgreen', '7': 'red' };
        var statusCode = '1', statusText = 'unknown';
        for (let i = 0; i < parsedData.info.classifiers.length; i++) {
          let matched = pattern.exec(parsedData.info.classifiers[i]);
          if (matched && matched[1] && matched[2]) {
            statusCode = matched[1];
            statusText = matched[2].toLowerCase().replace('-', '--');
            if (statusText === 'production/stable') {
              statusText = 'stable';
            }
            break;
          }
        }
        badgeData.text[0] = getLabel('status', data);
        badgeData.text[1] = statusText;
        badgeData.colorscheme = statusColors[statusCode];
        sendBadge(format, badgeData);
      } else {
        // That request is incorrect.
        badgeData.text[1] = 'request unknown';
        sendBadge(format, badgeData);
      }
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// LuaRocks version integration.
camp.route(/^\/luarocks\/v\/([^/]+)\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const user = match[1];   // eg, `leafo`.
  const moduleName = match[2];   // eg, `lapis`.
  const format = match[4];
  const apiUrl = 'https://luarocks.org/manifests/' + user + '/manifest.json';
  const badgeData = getBadgeData('luarocks', data);
  let version = match[3];   // you can explicitly specify a version
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    let versions;
    try {
      const moduleInfo = JSON.parse(buffer).repository[moduleName];
      versions = Object.keys(moduleInfo);
      if (version && versions.indexOf(version) === -1) {
        throw new Error('unknown version');
      }
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    if (!version) {
      if (versions.length === 1) {
        version = omitv(versions[0]);
      } else {
        let latestVersionString, latestVersionList;
        versions.forEach(function(versionString) {
          versionString = omitv(versionString);   // remove leading 'v'
          let versionList = luarocksParseVersion(versionString);
          if (
            !latestVersionList ||   // first iteration
            luarocksCompareVersionLists(versionList, latestVersionList) > 0
          ) {
            latestVersionString = versionString;
            latestVersionList = versionList;
          }
        });
        version = latestVersionString;
      }
    }
    let color;
    switch (version.slice(0, 3).toLowerCase()) {
      case 'dev':
        color = 'yellow';
        break;
      case 'scm':
      case 'cvs':
        color = 'orange';
        break;
      default:
        color = 'brightgreen';
    }
    badgeData.text[1] = versionText(version);
    badgeData.colorscheme = color;
    sendBadge(format, badgeData);
  });
}));

// Dart's pub version integration.
camp.route(/^\/pub\/v(pre)?\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const includePre = Boolean(match[1]);
  const userRepo = match[2]; // eg, "box2d"
  const format = match[3];
  const apiUrl = 'https://pub.dartlang.org/packages/' + userRepo + '.json';
  let badgeData = getBadgeData('pub', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      // Grab the latest stable version, or an unstable
      var versions = data.versions;
      var version = latestVersion(versions, { pre: includePre });
      badgeData.text[1] = versionText(version);
      badgeData.colorscheme = versionColor(version);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Hex.pm integration.
camp.route(/^\/hexpm\/([^/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(queryParams, match, sendBadge, request) {
  const info = match[1];
  const repo = match[2];  // eg, `httpotion`.
  const format = match[3];
  const apiUrl = 'https://hex.pm/api/packages/' + repo;
  const badgeData = getBadgeData('hex', queryParams);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      const data = JSON.parse(buffer);
      if (info.charAt(0) === 'd') {
        badgeData.text[0] = getLabel('downloads', queryParams);
        var downloads;
        switch (info.charAt(1)) {
          case 'w':
            downloads = data.downloads.week;
            badgeData.text[1] = metric(downloads) + '/week';
            break;
          case 'd':
            downloads = data.downloads.day;
            badgeData.text[1] = metric(downloads) + '/day';
            break;
          case 't':
            downloads = data.downloads.all;
            badgeData.text[1] = metric(downloads);
            break;
        }
        badgeData.colorscheme = downloadCountColor(downloads);
        sendBadge(format, badgeData);
      } else if (info === 'v') {
        const version = data.releases[0].version;
        badgeData.text[1] = versionText(version);
        badgeData.colorscheme = versionColor(version);
        sendBadge(format, badgeData);
      } else if (info == 'l') {
        const license = (data.meta.licenses || []).join(', ');
        badgeData.text[0] = getLabel(maybePluralize('license', data.meta.licenses), queryParams);
        if (license == '') {
          badgeData.text[1] = 'Unknown';
        } else {
          badgeData.text[1] = license;
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      }
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Coveralls integration.
camp.route(/^\/coveralls\/(?:(bitbucket|github)\/)?([^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repoService = match[1] ? match[1] : 'github';
  var userRepo = match[2];  // eg, `jekyll/jekyll`.
  var branch = match[3];
  var format = match[4];
  var apiUrl = {
    url: `https://coveralls.io/repos/${repoService}/${userRepo}/badge.svg`,
    followRedirect: false,
    method: 'HEAD',
  };
  if (branch) {
    apiUrl.url += '?branch=' + branch;
  }
  var badgeData = getBadgeData('coverage', data);
  request(apiUrl, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    // We should get a 302. Look inside the Location header.
    var buffer = res.headers.location;
    if (!buffer) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var score = buffer.split('_')[1].split('.')[0];
      var percentage = parseInt(score);
      if (percentage !== percentage) {
        // It is NaN, treat it as unknown.
        badgeData.text[1] = 'unknown';
        sendBadge(format, badgeData);
        return;
      }
      badgeData.text[1] = score + '%';
      badgeData.colorscheme = coveragePercentageColor(percentage);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'malformed';
      sendBadge(format, badgeData);
    }
  });
}));

// Codecov integration.
camp.route(/^\/codecov\/c\/(?:token\/(\w+))?[+/]?([^/]+\/[^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var token = match[1];
  var userRepo = match[2];  // eg, `github/codecov/example-python`.
  var branch = match[3];
  var format = match[4];
  let apiUrl;
  if (branch) {
    apiUrl = `https://codecov.io/${userRepo}/branch/${branch}/graphs/badge.txt`;
  } else {
    apiUrl = `https://codecov.io/${userRepo}/graphs/badge.txt`;
  }
  if (token) {
    apiUrl += '?' + queryString.stringify({ token });
  }
  var badgeData = getBadgeData('coverage', data);
  request(apiUrl, function(err, res, body) {
    if (err != null) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    try {
      // Body: range(0, 100) or "unknown"
      var coverage = body.trim();
      // Is `coverage` NaN when converted to number?
      if (+coverage !== +coverage) {
        badgeData.text[1] = 'unknown';
        sendBadge(format, badgeData);
        return;
      }
      badgeData.text[1] = coverage + '%';
      badgeData.colorscheme = coveragePercentageColor(coverage);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'malformed';
      sendBadge(format, badgeData);
    }
  });
}));

// Code Climate integration.
camp.route(/^\/codeclimate(\/(c|coverage|maintainability|issues|tech-debt)(-letter|-percentage)?)?\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  let type;
  if (match[2] === 'c' || !match[2]) {
    // Top-level and /coverage URLs equivalent to /c, still supported for backwards compatibility. See #1387.
    type = 'coverage';
  } else if (match[2] === 'tech-debt') {
    type = 'technical debt';
  } else {
    type = match[2];
  }
  // For maintainability, default is letter, alternative is percentage. For coverage, default is percentage, alternative is letter.
  const isAlternativeFormat = match[3];
  const userRepo = match[4];  // eg, `twbs/bootstrap`.
  const format = match[5];
  request({
      method: 'GET',
      uri: `https://api.codeclimate.com/v1/repos?github_slug=${userRepo}`,
      json: true,
  }, function (err, res, body) {
    const badgeData = getBadgeData(type, data);
    if (err != null) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }

    try {
      if (!body.data || body.data.length === 0) {
        badgeData.text[1] = 'not found';
        sendBadge(format, badgeData);
        return;
      }

      const branchData = type === 'coverage'
        ? body.data[0].relationships.latest_default_branch_test_report.data
        : body.data[0].relationships.latest_default_branch_snapshot.data;
      if (branchData == null) {
        badgeData.text[1] = 'unknown';
        sendBadge(format, badgeData);
        return;
      }

      const url = `https://api.codeclimate.com/v1/repos/${body.data[0].id}/${type === 'coverage' ? 'test_reports' : 'snapshots'}/${branchData.id}`;
      request(url, function(err, res, buffer) {
        if (err != null) {
          badgeData.text[1] = 'invalid';
          sendBadge(format, badgeData);
          return;
        }

        try {
          const parsedData = JSON.parse(buffer);
          if (type === 'coverage' && isAlternativeFormat) {
            const score = parsedData.data.attributes.rating.letter;
            badgeData.text[1] = score;
            badgeData.colorscheme = letterScoreColor(score);
          } else if (type === 'coverage') {
            const percentage = parseFloat(parsedData.data.attributes.covered_percent);
            badgeData.text[1] = percentage.toFixed(0) + '%';
            badgeData.colorscheme = coveragePercentageColor(percentage);
          } else if (type === 'issues') {
            const count = parsedData.data.meta.issues_count;
            badgeData.text[1] = count;
            badgeData.colorscheme = colorScale([1, 5, 10, 20], ['brightgreen', 'green', 'yellowgreen', 'yellow', 'red'])(count);
          } else if (type === 'technical debt') {
            const percentage = parseFloat(parsedData.data.attributes.ratings[0].measure.value);
            badgeData.text[1] = percentage.toFixed(0) + '%';
            badgeData.colorscheme = colorScale([5, 10, 20, 50], ['brightgreen', 'green', 'yellowgreen', 'yellow', 'red'])(percentage);
          } else if (type === 'maintainability' && isAlternativeFormat) {
            // maintainability = 100 - technical debt
            const percentage = 100 - parseFloat(parsedData.data.attributes.ratings[0].measure.value);
            badgeData.text[1] = percentage.toFixed(0) + '%';
            badgeData.colorscheme = colorScale([50, 80, 90, 95], ['red', 'yellow', 'yellowgreen', 'green', 'brightgreen'])(percentage);
          } else if (type === 'maintainability') {
            const score = parsedData.data.attributes.ratings[0].letter;
            badgeData.text[1] = score;
            badgeData.colorscheme = letterScoreColor(score);
          }
          sendBadge(format, badgeData);
        } catch(e) {
            badgeData.text[1] = 'invalid';
            sendBadge(format, badgeData);
        }
      });
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Scrutinizer coverage integration.
camp.route(/^\/scrutinizer(?:\/(build|coverage))?\/([^/]+\/[^/]+\/[^/]+|gp\/[^/])(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const type = match[1] ? match[1] : 'code quality';
  const repo = match[2];  // eg, g/phpmyadmin/phpmyadmin
  let branch = match[3];
  const format = match[4];
  const apiUrl = `https://scrutinizer-ci.com/api/repositories/${repo}`;
  const badgeData = getBadgeData(type, data);
  request(apiUrl, {}, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res, { 404: 'project or branch not found' })) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const parsedData = JSON.parse(buffer);
      // Which branch are we dealing with?
      if (branch === undefined) {
        branch = parsedData.default_branch;
      }
      if (type === 'coverage') {
        const percentage = parsedData.applications[branch].index._embedded
          .project.metric_values['scrutinizer.test_coverage'] * 100;
        if (isNaN(percentage)) {
          badgeData.text[1] = 'unknown';
          badgeData.colorscheme = 'gray';
        } else {
          badgeData.text[1] = percentage.toFixed(0) + '%';
          badgeData.colorscheme = coveragePercentageColor(percentage);
        }
      } else if (type === 'build') {
        const status = parsedData.applications[branch].build_status.status;
        badgeData.text[1] = status;
        if (status === 'passed') {
          badgeData.colorscheme = 'brightgreen';
          badgeData.text[1] = 'passing';
        } else if (status === 'failed' || status === 'error') {
          badgeData.colorscheme = 'red';
        } else if (status === 'pending') {
          badgeData.colorscheme = 'orange';
        } else if (status === 'unknown') {
          badgeData.colorscheme = 'gray';
        }
      } else {
        let score = parsedData.applications[branch].index._embedded
          .project.metric_values['scrutinizer.quality'];
        score = Math.round(score * 100) / 100;
        badgeData.text[1] = score;
        if (score > 9) {
          badgeData.colorscheme = 'brightgreen';
        } else if (score > 7) {
          badgeData.colorscheme = 'green';
        } else if (score > 5) {
          badgeData.colorscheme = 'yellow';
        } else if (score > 4) {
          badgeData.colorscheme = 'orange';
        } else {
          badgeData.colorscheme = 'red';
        }
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// David integration
camp.route(/^\/david\/(dev\/|optional\/|peer\/)?(.+?)\.(svg|png|gif|jpg|json)$/,
cache({
  queryParams: ['path'],
  handler: function(data, match, sendBadge, request) {
    var dev = match[1];
    if (dev != null) { dev = dev.slice(0, -1); }  // 'dev', 'optional' or 'peer'.
    // eg, `expressjs/express`, `webcomponents/generator-element`.
    var userRepo = match[2];
    var format = match[3];
    var options = 'https://david-dm.org/' + userRepo + '/'
      + (dev ? (dev + '-') : '') + 'info.json';
    if (data.path) {
      // path can be used to specify the package.json location, useful for monorepos
      options += '?path=' + data.path;
    }
    var badgeData = getBadgeData( (dev? (dev+'D') :'d') + 'ependencies', data);
    request(options, function(err, res, buffer) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      } else if (res.statusCode === 500) {
        /* note:
        david returns a 500 response for 'not found'
        e.g: https://david-dm.org/foo/barbaz/info.json
        not a 404 so we can't handle 'not found' cleanly
        because this might also be some other error.
        */
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
        return;
      }
      try {
        var data = JSON.parse(buffer);
        var status = data.status;
        if (status === 'insecure') {
          badgeData.colorscheme = 'red';
          status = 'insecure';
        } else if (status === 'notsouptodate') {
          badgeData.colorscheme = 'yellow';
          status = 'up to date';
        } else if (status === 'outofdate') {
          badgeData.colorscheme = 'red';
          status = 'out of date';
        } else if (status === 'uptodate') {
          badgeData.colorscheme = 'brightgreen';
          status = 'up to date';
        } else if (status === 'none') {
          badgeData.colorscheme = 'brightgreen';
        }
        badgeData.text[1] = status;
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
        return;
      }
    });
  },
}));

// dotnet-status integration - deprecated as of April 2018.
camp.route(/^\/dotnetstatus\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const format = match[2];
  const badgeData = getDeprecatedBadge('dotnet status', data);
  sendBadge(format, badgeData);
}));

// Gemnasium integration
camp.route(/^\/gemnasium\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, `jekyll/jekyll`.
  var format = match[2];

  if (isDeprecated('gemnasium', serverStartTime)) {
    const badgeData = getDeprecatedBadge('gemnasium', data);
    sendBadge(format, badgeData);
    return;
  }

  var options = 'https://gemnasium.com/' + userRepo + '.svg';
  var badgeData = getBadgeData('dependencies', data);
  request(options, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var nameMatch = buffer.match(/(devD|d)ependencies/)[0];
      var statusMatch = buffer.match(/'14'>(.+)<\/text>\s*<\/g>/)[1];
      badgeData.text[0] = getLabel(nameMatch, data);
      badgeData.text[1] = statusMatch;
      if (statusMatch === 'up-to-date') {
        badgeData.text[1] = 'up to date';
        badgeData.colorscheme = 'brightgreen';
      } else if (statusMatch === 'out-of-date') {
        badgeData.text[1] = 'out of date';
        badgeData.colorscheme = 'yellow';
      } else if (statusMatch === 'update!') {
        badgeData.colorscheme = 'red';
      } else if (statusMatch === 'none') {
        badgeData.colorscheme = 'brightgreen';
      } else {
        badgeData.text[1] = 'undefined';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
  });
}));

// Depfu integration
camp.route(/^\/depfu\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, `jekyll/jekyll`.
  var format = match[2];
  var url = 'https://depfu.com/github/shields/' + userRepo;
  var badgeData = getBadgeData('dependencies', data);
  request(url, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(res['body']);
      badgeData.text[1] = data['text'];
      badgeData.colorscheme = data['colorscheme'];
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// VersionEye integration
camp.route(/^\/versioneye\/d\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, `ruby/rails`.
  var format = match[2];
  var url = 'https://www.versioneye.com/' + userRepo + '/badge.svg';
  var badgeData = getBadgeData('dependencies', data);
  fetchFromSvg(request, url, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      badgeData.text[1] = res;
      if (res === 'up to date') {
        badgeData.colorscheme = 'brightgreen';
      } else if (res === 'none') {
        badgeData.colorscheme = 'green';
      } else if (res === 'out of date') {
        badgeData.colorscheme = 'yellow';
      } else {
        badgeData.colorscheme = 'red';
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Codacy integration
camp.route(/^\/codacy\/(?:grade\/)?(?!coverage\/)([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectId = match[1];  // eg. e27821fb6289410b8f58338c7e0bc686
  var branch = match[2];
  var format = match[3];

  var queryParams = {};
  if (branch) {
    queryParams.branch = branch;
  }
  var query = queryString.stringify(queryParams);
  var url = 'https://api.codacy.com/project/badge/grade/' + projectId + '?' + query;
  var badgeData = getBadgeData('code quality', data);
  fetchFromSvg(request, url, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      badgeData.text[1] = res;
      if (res === 'A') {
        badgeData.colorscheme = 'brightgreen';
      } else if (res === 'B') {
        badgeData.colorscheme = 'green';
      } else if (res === 'C') {
        badgeData.colorscheme = 'yellowgreen';
      } else if (res === 'D') {
        badgeData.colorscheme = 'yellow';
      } else if (res === 'E') {
        badgeData.colorscheme = 'orange';
      } else if (res === 'F') {
        badgeData.colorscheme = 'red';
      } else if (res === 'X') {
        badgeData.text[1] = 'invalid';
        badgeData.colorscheme = 'lightgrey';
      } else {
        badgeData.colorscheme = 'red';
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Discourse integration
camp.route(/^\/discourse\/(http(?:s)?)\/(.*)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const scheme = match[1]; // eg, https
  const host   = match[2]; // eg, meta.discourse.org
  const stat   = match[3]; // eg, user_count
  const format = match[4];
  const url    = scheme + '://' + host + '/site/statistics.json';

  const options = {
    method: 'GET',
    uri: url,
    headers: {
      'Accept': 'application/json',
    },
  };

  var badgeData = getBadgeData('discourse', data);
  request(options, function(err, res) {
    if (err != null) {
      if (res) {
        console.error('' + res);
      }

      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    if (res.statusCode !== 200) {
      badgeData.text[1] = 'inaccessible';
      badgeData.colorscheme = 'red';
      sendBadge(format, badgeData);
      return;
    }

    badgeData.colorscheme = 'brightgreen';

    try {
      var data = JSON.parse(res['body']);
      let statCount;

      switch (stat) {
        case 'topics':
          statCount = data.topic_count;
          badgeData.text[1] = metric(statCount) + ' topics';
          break;
        case 'posts':
          statCount = data.post_count;
          badgeData.text[1] = metric(statCount) + ' posts';
          break;
        case 'users':
          statCount = data.user_count;
          badgeData.text[1] = metric(statCount) + ' users';
          break;
        case 'likes':
          statCount = data.like_count;
          badgeData.text[1] = metric(statCount) + ' likes';
          break;
        case 'status':
          badgeData.text[1] = 'online';
          break;
        default:
          badgeData.text[1] = 'invalid';
          badgeData.colorscheme = 'yellow';
          break;
      }

      sendBadge(format, badgeData);
    } catch(e) {
      console.error('' + e.stack);
      badgeData.colorscheme = 'yellow';
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });

}));

// ReadTheDocs build
camp.route(/^\/readthedocs\/([^/]+)(?:\/(.+))?.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var project = match[1];
  var version = match[2];
  var format = match[3];
  var badgeData = getBadgeData('docs', data);
  var url = 'https://readthedocs.org/projects/' + encodeURIComponent(project) + '/badge/';
  if (version != null) {
    url += '?version=' + encodeURIComponent(version);
  }
  fetchFromSvg(request, url, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      badgeData.text[1] = res;
      if (res === 'passing') {
        badgeData.colorscheme = 'brightgreen';
      } else if (res === 'failing') {
        badgeData.colorscheme = 'red';
      } else if (res === 'unknown') {
        badgeData.colorscheme = 'yellow';
      } else {
        badgeData.colorscheme = 'red';
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

camp.route(/^\/codacy\/coverage\/(?!grade\/)([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectId = match[1];  // eg. e27821fb6289410b8f58338c7e0bc686
  var branch = match[2];
  var format = match[3];

  var queryParams = {};
  if (branch) {
    queryParams.branch = branch;
  }
  var query = queryString.stringify(queryParams);
  var url = 'https://api.codacy.com/project/badge/coverage/' + projectId + '?' + query;
  var badgeData = getBadgeData('coverage', data);
  fetchFromSvg(request, url, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      badgeData.text[1] = res;
      badgeData.colorscheme = coveragePercentageColor(parseInt(res));
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Hackage version integration.
camp.route(/^\/hackage\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, `lens`.
  var format = match[2];
  var apiUrl = 'https://hackage.haskell.org/package/' + repo + '/' + repo + '.cabal';
  var badgeData = getBadgeData('hackage', data);
  request(apiUrl, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }

    try {
      var lines = buffer.split("\n");
      var versionLines = lines.filter(function(e) {
        return (/^version:/i).test(e) === true;
      });
      // We don't have to check length of versionLines, because if we throw,
      // we'll render the 'invalid' badge below, which is the correct thing
      // to do.
      var version = versionLines[0].split(/:/)[1].trim();
      badgeData.text[1] = versionText(version);
      badgeData.colorscheme = versionColor(version);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Hackage dependencies version integration.
camp.route(/^\/hackage-deps\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const repo = match[1];  // eg, `lens`.
  const format = match[2];
  const reverseUrl = 'http://packdeps.haskellers.com/licenses/' + repo;
  const feedUrl = 'http://packdeps.haskellers.com/feed/' + repo;
  const badgeData = getBadgeData('dependencies', data);

  // first call /reverse to check if the package exists
  // this will throw a 404 if it doesn't
  request(reverseUrl, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }

    // if the package exists, then query /feed to check the dependencies
    request(feedUrl, function(err, res, buffer) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }

      try {
        const outdatedStr = "Outdated dependencies for " + repo + " ";
        if (buffer.indexOf(outdatedStr) >= 0) {
          badgeData.text[1] = 'outdated';
          badgeData.colorscheme = 'orange';
        } else {
          badgeData.text[1] = 'up to date';
          badgeData.colorscheme = 'brightgreen';
        }
      } catch(e) {
        badgeData.text[1] = 'invalid';
      }
      sendBadge(format, badgeData);
    });

  });

}));

// Elm package version integration.
camp.route(/^\/elm-package\/v\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const urlPrefix = 'http://package.elm-lang.org/packages';
  const [, user, repo, format] = match;
  const apiUrl = `${urlPrefix}/${user}/${repo}/latest/elm-package.json`;
  const badgeData = getBadgeData('elm-package', data);
  request(apiUrl, (err, res, buffer) => {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      const data = JSON.parse(buffer);
      if (data && typeof data.version === 'string') {
        badgeData.text[1] = versionText(data.version);
        badgeData.colorscheme = versionColor(data.version);
      }
      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
})
);

// CocoaPods version integration.
camp.route(/^\/cocoapods\/(v|p|l)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];
  var spec = match[2];  // eg, AFNetworking
  var format = match[3];
  var apiUrl = 'https://trunk.cocoapods.org/api/v1/pods/' + spec + '/specs/latest';
  const typeToLabel = { 'v' : 'pod', 'p': 'platform', 'l': 'license' };
  const badgeData = getBadgeData(typeToLabel[type], data);
  badgeData.colorscheme = null;
  request(apiUrl, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var parsedData = JSON.parse(buffer);
      var version = parsedData.version;
      var license;
      if (typeof parsedData.license === 'string') {
        license = parsedData.license;
      } else { license = parsedData.license.type; }

      var platforms = Object.keys(parsedData.platforms || {
        'ios' : '5.0',
        'osx' : '10.7',
      }).join(' | ');
      if (type === 'v') {
        badgeData.text[1] = versionText(version);
        badgeData.colorscheme = versionColor(version);
      } else if (type === 'p') {
        badgeData.text[1] = platforms;
        badgeData.colorB = '#989898';
      } else if (type === 'l') {
        badgeData.text[1] = license;
        badgeData.colorB = '#373737';
      }

      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// CocoaPods metrics
camp.route(/^\/cocoapods\/metrics\/doc-percent\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var spec = match[1];  // eg, AFNetworking
  var format = match[2];
  var apiUrl = 'https://metrics.cocoapods.org/api/v1/pods/' + spec;
  var badgeData = getBadgeData('docs', data);
  request(apiUrl, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var parsedData = JSON.parse(buffer);
      var percentage = parsedData.cocoadocs.doc_percent;
      if (percentage == null) {
        percentage = 0;
      }
      badgeData.colorscheme = coveragePercentageColor(percentage);
      badgeData.text[1] = percentage + '%';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Cocoapods Downloads integration.
camp.route(/^\/cocoapods\/(dm|dw|dt)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // One of these: "dm", "dw", "dt"
  var spec = match[2];  // eg, AFNetworking
  var format = match[3];
  var apiUrl = 'https://metrics.cocoapods.org/api/v1/pods/' + spec;
  var badgeData = getBadgeData('downloads', data);
  request(apiUrl, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var downloads = 0;
      switch (info.charAt(1)) {
        case 'm':
          downloads = data.stats.download_month;
          badgeData.text[1] = metric(downloads) + '/month';
          break;
        case 'w':
          downloads = data.stats.download_week;
          badgeData.text[1] = metric(downloads) + '/week';
          break;
        case 't':
          downloads = data.stats.download_total;
          badgeData.text[1] = metric(downloads);
          break;
      }
      badgeData.colorscheme = downloadCountColor(downloads);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// CocoaPods Apps Integration
camp.route(/^\/cocoapods\/(aw|at)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // One of these: "aw", "at"
  var spec = match[2];  // eg, AFNetworking
  var format = match[3];
  var apiUrl = 'https://metrics.cocoapods.org/api/v1/pods/' + spec;
  var badgeData = getBadgeData('apps', data);
  request(apiUrl, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var apps = 0;
      switch (info.charAt(1)) {
        case 'w':
          apps = data.stats.app_week;
          badgeData.text[1] = metric(apps) + '/week';
          break;
        case 't':
          apps = data.stats.app_total;
          badgeData.text[1] = metric(apps);
          break;
      }
      badgeData.colorscheme = downloadCountColor(apps);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

camp.route(/^\/sourcegraph\/rrc\/([\s\S]+)\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var repo = match[1];
  var format = match[2];
  var apiUrl = "https://sourcegraph.com/.api/repos/" + repo + "/-/shield";
  var badgeData = getBadgeData('used by', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      badgeData.colorscheme = 'brightgreen';
      var data = JSON.parse(buffer);
      badgeData.text[1] = data.value;
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub tag integration.
camp.route(/^\/github\/tag(-?pre)?\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const includePre = Boolean(match[1]);
  const user = match[2];  // eg, expressjs/express
  const repo = match[3];
  const format = match[4];
  const apiUrl = `/repos/${user}/${repo}/tags`;
  let badgeData = getBadgeData('tag', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var versions = data.map(function(e) { return e.name; });
      var tag = latestVersion(versions, { pre: includePre });
      badgeData.text[1] = versionText(tag);
      badgeData.colorscheme = versionColor(tag);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'none';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub package and manifest version integration.
camp.route(/^\/github\/(package|manifest)-json\/([^/]+)\/([^/]+)\/([^/]+)\/?([^/]+)?\.(svg|png|gif|jpg|json)$/,
cache(function(query_data, match, sendBadge, request) {
  var type = match[1];
  var info = match[2];
  var user = match[3];
  var repo = match[4];
  var branch = match[5] || 'master';
  var format = match[6];
  var apiUrl = 'https://raw.githubusercontent.com/' + user + '/' + repo + '/' + branch + '/' + type + '.json';
  var badgeData = getBadgeData(type, query_data);
  request(apiUrl, function(err, res, buffer) {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var json_data = JSON.parse(buffer);
      switch(info) {
        case 'v':
        case 'version':
          var version = json_data.version;
          badgeData.text[1] = versionText(version);
          badgeData.colorscheme = versionColor(version);
          break;
        case 'n':
          info = 'name';
          // falls through
        default:
          var value = typeof json_data[info] != 'undefined' && typeof json_data[info] != 'object' ? json_data[info] : Array.isArray(json_data[info]) ? json_data[info].join(", ") : 'invalid data';
          badgeData.text[0] = getLabel(`${type} ${info}`, query_data);
          badgeData.text[1] = value;
          badgeData.colorscheme = value != 'invalid data' ? 'blue' : 'lightgrey';
          break;
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid data';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub contributors integration.
camp.route(/^\/github\/contributors(-anon)?\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var isAnon = match[1];
  var user = match[2];
  var repo = match[3];
  var format = match[4];
  const apiUrl = `/repos/${user}/${repo}/contributors?page=1&per_page=1&anon=${!!isAnon}`;
  var badgeData = getBadgeData('contributors', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var contributors;

      if (res.headers['link'] && res.headers['link'].indexOf('rel="last"') !== -1) {
        contributors = res.headers['link'].match(/[?&]page=(\d+)[^>]+>; rel="last"/)[1];
      } else {
        contributors = JSON.parse(buffer).length;
      }

      badgeData.text[1] = metric(+contributors);
      badgeData.colorscheme = 'blue';
    } catch(e) {
      badgeData.text[1] = 'inaccessible';
    }
    sendBadge(format, badgeData);
  });
}));

// GitHub release integration
camp.route(/^\/github\/release\/([^/]+\/[^/]+)(?:\/(all))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, qubyte/rubidium
  var allReleases = match[2];
  var format = match[3];
  let apiUrl = `/repos/${userRepo}/releases`;
  if (allReleases === undefined) {
    apiUrl = apiUrl + '/latest';
  }
  var badgeData = getBadgeData('release', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (allReleases === 'all') {
        data = data[0];
      }
      var version = data.tag_name;
      var prerelease = data.prerelease;
      badgeData.text[1] = versionText(version);
      badgeData.colorscheme = prerelease ? 'orange' : 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'none';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub release & pre-release date integration.
mapGithubReleaseDate({ camp, cache }, githubApiProvider);

// GitHub commits since integration.
mapGithubCommitsSince({ camp, cache }, githubApiProvider);

// GitHub release-download-count and pre-release-download-count integration.
camp.route(/^\/github\/(downloads|downloads-pre)\/([^/]+)\/([^/]+)(\/.+)?\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const type = match[1]; // downloads or downloads-pre
  var user = match[2];  // eg, qubyte/rubidium
  var repo = match[3];

  var tag = match[4];  // eg, v0.190.0, latest, null if querying all releases
  var asset_name = match[5].toLowerCase(); // eg. total, atom-amd64.deb, atom.x86_64.rpm
  var format = match[6];

  if (tag) { tag = tag.slice(1); }

  var total = true;
  if (tag) {
    total = false;
  }

  let apiUrl = `/repos/${user}/${repo}/releases`;
  if (!total) {
    var release_path = tag === 'latest' ? (type === 'downloads' ? 'latest' : '') : 'tags/' + tag;
    if (release_path) {
      apiUrl = apiUrl + '/' + release_path;
    }
  }
  var badgeData = getBadgeData('downloads', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res, 'repo or release not found')) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (type === 'downloads-pre' && tag === 'latest') {
        data = data[0];
      }
      var downloads = 0;

      const labelWords = [];
      if (total) {
        data.forEach(function (tagData) {
          tagData.assets.forEach(function (asset) {
            if (asset_name === 'total' || asset_name === asset.name.toLowerCase()) {
              downloads += asset.download_count;
            }
          });
        });

        labelWords.push('total');
        if (asset_name !== 'total') {
          labelWords.push(`[${asset_name}]`);
        }
      } else {
        data.assets.forEach(function (asset) {
          if (asset_name === 'total' || asset_name === asset.name.toLowerCase()) {
            downloads += asset.download_count;
          }
        });

        if (tag !== 'latest') {
          labelWords.push(tag);
        }
        if (asset_name !== 'total') {
          labelWords.push(`[${asset_name}]`);
        }
      }
      labelWords.unshift(metric(downloads));
      badgeData.text[1] = labelWords.join(' ');
      badgeData.colorscheme = 'brightgreen';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'none';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub issues integration.
camp.route(/^\/github\/issues(-pr)?(-closed)?(-raw)?\/(?!detail)([^/]+)\/([^/]+)\/?(.+)?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var isPR = !!match[1];
  var isClosed = !!match[2];
  var isRaw = !!match[3];
  var user = match[4];  // eg, badges
  var repo = match[5];  // eg, shields
  var ghLabel = match[6];  // eg, website
  var format = match[7];
  var query = {};
  var hasLabel = (ghLabel !== undefined);

  query.q = 'repo:' + user + '/' + repo +
    (isPR? ' is:pr': ' is:issue') +
    (isClosed? ' is:closed': ' is:open') +
    (hasLabel? ` label:"${ghLabel}"` : '');

  var classText = isClosed? 'closed': 'open';
  var leftClassText = isRaw? classText + ' ': '';
  var rightClassText = !isRaw? ' ' + classText: '';
  const isGhLabelMultiWord = hasLabel && ghLabel.includes(' ');
  var labelText = hasLabel? (isGhLabelMultiWord? `"${ghLabel}"`: ghLabel) + ' ': '';
  var targetText = isPR? 'pull requests': 'issues';
  var badgeData = getBadgeData(leftClassText + labelText + targetText, data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
  }
  githubApiProvider.request(request, '/search/issues', query, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var issues = data.total_count;
      badgeData.text[1] = metric(issues) + rightClassText;
      badgeData.colorscheme = (issues > 0)? 'yellow': 'brightgreen';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub issue detail integration.
camp.route(/^\/github\/(?:issues|pulls)\/detail\/(s|title|u|label|comments|age|last-update)\/([^/]+)\/([^/]+)\/(\d+)\.(svg|png|gif|jpg|json)$/,
cache((queryParams, match, sendBadge, request) => {
  const [, which, owner, repo, number, format] = match;
  const uri = `/repos/${owner}/${repo}/issues/${number}`;
  const badgeData = getBadgeData(`issue/pull request ${number}`, queryParams);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', queryParams);
  }
  githubApiProvider.request(request, uri, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res, 'issue, pull request or repo not found')) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const parsedData = JSON.parse(buffer);
      const isPR = 'pull_request' in parsedData;
      const noun = isPR ? 'pull request' : 'issue';
      badgeData.text[0] = getLabel(`${noun} ${parsedData.number}`, queryParams);
      switch (which) {
        case 's': {
          const state = badgeData.text[1] = parsedData.state;
          badgeData.colorscheme = null;
          badgeData.colorB = makeColorB(githubStateColor(state), queryParams);
          break;
        }
        case 'title':
          badgeData.text[1] = parsedData.title;
          break;
        case 'u':
          badgeData.text[0] = getLabel('author', queryParams);
          badgeData.text[1] = parsedData.user.login;
          break;
        case 'label':
          badgeData.text[0] = getLabel('label', queryParams);
          badgeData.text[1] = parsedData.labels.map(i => i.name).join(' | ');
          if (parsedData.labels.length === 1) {
            badgeData.colorscheme = null;
            badgeData.colorB = makeColorB(parsedData.labels[0].color, queryParams);
          }
          break;
        case 'comments': {
          badgeData.text[0] = getLabel('comments', queryParams);
          const comments = badgeData.text[1] = parsedData.comments;
          badgeData.colorscheme = null;
          badgeData.colorB = makeColorB(githubCommentsColor(comments), queryParams);
          break;
        }
        case 'age':
        case 'last-update': {
          const label = which === 'age' ? 'created' : 'updated';
          const date = which === 'age' ? parsedData.created_at : parsedData.updated_at;
          badgeData.text[0] = getLabel(label, queryParams);
          badgeData.text[1] = formatDate(date);
          badgeData.colorscheme = ageColor(Date.parse(date));
          break;
        }
        default:
          throw Error('Unreachable due to regex');
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub pull request build status integration.
camp.route(/^\/github\/status\/(s|contexts)\/pulls\/([^/]+)\/([^/]+)\/(\d+)\.(svg|png|gif|jpg|json)$/,
cache((queryParams, match, sendBadge, request) => {
  const [, which, owner, repo, number, format] = match;
  const issueUri = `/repos/${owner}/${repo}/pulls/${number}`;
  const badgeData = getBadgeData('checks', queryParams);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', queryParams);
  }
  githubApiProvider.request(request, issueUri, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res, 'pull request or repo not found')) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const parsedData = JSON.parse(buffer);
      const ref = parsedData.head.sha;
      const statusUri = `/repos/${owner}/${repo}/commits/${ref}/status`;
      githubApiProvider.request(request, statusUri, {}, (err, res, buffer) => {
        try {
          const parsedData = JSON.parse(buffer);
          const state = badgeData.text[1] = parsedData.state;
          badgeData.colorscheme = null;
          badgeData.colorB = makeColorB(githubCheckStateColor(state), queryParams);
          switch(which) {
            case 's':
              badgeData.text[1] = state;
              break;
            case 'contexts': {
              const counts = countBy(parsedData.statuses, 'state');
              badgeData.text[1] = Object.keys(counts).map(k => `${counts[k]} ${k}`).join(', ');
              break;
            }
            default:
              throw Error('Unreachable due to regex');
          }
          sendBadge(format, badgeData);
        } catch(e) {
          badgeData.text[1] = 'invalid';
          sendBadge(format, badgeData);
        }
      });
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub forks integration.
camp.route(/^\/github\/forks\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte/rubidium
  var repo = match[2];
  var format = match[3];
  const apiUrl = `/repos/${user}/${repo}`;
  var badgeData = getBadgeData('forks', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
    badgeData.links = [
      'https://github.com/' + user + '/' + repo + '/fork',
      'https://github.com/' + user + '/' + repo + '/network',
     ];
  }
  githubApiProvider.request(request, apiUrl, {}, function(err, res, buffer) {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var forks = data.forks_count;
      badgeData.text[1] = forks;
      badgeData.colorscheme = null;
      badgeData.colorB = '#4183C4';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub stars integration.
camp.route(/^\/github\/stars\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte/rubidium
  var repo = match[2];
  var format = match[3];
  const apiUrl = `/repos/${user}/${repo}`;
  var badgeData = getBadgeData('stars', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
    badgeData.links = [
      'https://github.com/' + user + '/' + repo,
      'https://github.com/' + user + '/' + repo + '/stargazers',
     ];
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      badgeData.text[1] = metric(JSON.parse(buffer).stargazers_count);
      badgeData.colorscheme = null;
      badgeData.colorB = '#4183C4';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub watchers integration.
camp.route(/^\/github\/watchers\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte/rubidium
  var repo = match[2];
  var format = match[3];
  const apiUrl = `/repos/${user}/${repo}`;
  var badgeData = getBadgeData('watchers', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
    badgeData.links = [
      'https://github.com/' + user + '/' + repo,
      'https://github.com/' + user + '/' + repo + '/watchers',
     ];
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      badgeData.text[1] = JSON.parse(buffer).subscribers_count;
      badgeData.colorscheme = null;
      badgeData.colorB = '#4183C4';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub user followers integration.
camp.route(/^\/github\/followers\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte
  var format = match[2];
  const apiUrl = `/users/${user}`;
  var badgeData = getBadgeData('followers', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res, 'user not found')) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      badgeData.text[1] = JSON.parse(buffer).followers;
      badgeData.colorscheme = null;
      badgeData.colorB = '#4183C4';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub license integration.
camp.route(/^\/github\/license\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, mashape
  var repo = match[2];  // eg, apistatus
  var format = match[3];
  const apiUrl = `/repos/${user}/${repo}`;
  var badgeData = getBadgeData('license', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res, 'repo not found', { 403: 'access denied' })) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var body = JSON.parse(buffer);
      const license = body.license;
      if (license != null) {
        badgeData.text[1] = license.spdx_id || 'unknown';
        setBadgeColor(badgeData, licenseToColor(license.spdx_id));
        sendBadge(format, badgeData);
      } else {
        badgeData.text[1] = 'missing';
        badgeData.colorscheme = 'red';
        sendBadge(format, badgeData);
      }
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub file size.
camp.route(/^\/github\/size\/([^/]+)\/([^/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, mashape
  var repo = match[2];  // eg, apistatus
  var path = match[3];
  var format = match[4];
  const apiUrl = `/repos/${user}/${repo}/contents/${path}`;

  var badgeData = getBadgeData('size', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
  }

  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res, 'repo or file not found')) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var body = JSON.parse(buffer);
      if (body && Number.isInteger(body.size)) {
        badgeData.text[1] = prettyBytes(body.size);
        badgeData.colorscheme = 'green';
        sendBadge(format, badgeData);
      } else {
        badgeData.text[1] = 'not a regular file';
        sendBadge(format, badgeData);
      }
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub search hit counter.
camp.route(/^\/github\/search\/([^/]+)\/([^/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];
  var repo = match[2];
  var search = match[3];
  var format = match[4];
  var query = { q: search + ' repo:' + user + '/' + repo };
  var badgeData = getBadgeData(search + ' counter', data);
  githubApiProvider.request(request, '/search/code', query, function(err, res, buffer) {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var body = JSON.parse(buffer);
      badgeData.text[1] = metric(body.total_count);
      badgeData.colorscheme = 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub commit statistics integration.
camp.route(/^\/github\/commit-activity\/(y|4w|w)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const interval = match[1];
  const user = match[2];
  const repo = match[3];
  const format = match[4];
  const apiUrl = `/repos/${user}/${repo}/stats/commit_activity`;
  const badgeData = getBadgeData('commit activity', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
    badgeData.links = [`https://github.com/${user}/${repo}`];
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const parsedData = JSON.parse(buffer);
      let value;
      let intervalLabel;
      switch (interval) {
        case 'y':
          value = parsedData.reduce((sum, weekInfo) => sum + weekInfo.total, 0);
          intervalLabel = '/year';
          break;
        case '4w':
          value = parsedData.slice(-4).reduce((sum, weekInfo) => sum + weekInfo.total, 0);
          intervalLabel = '/4 weeks';
          break;
        case 'w':
          value = parsedData.slice(-2)[0].total;
          intervalLabel = '/week';
          break;
        default:
          throw Error('Unhandled case');
      }
      badgeData.text[1] = `${metric(value)}${intervalLabel}`;
      badgeData.colorscheme = 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub last commit integration.
camp.route(/^\/github\/last-commit\/([^/]+)\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const user = match[1];  // eg, mashape
  const repo = match[2];  // eg, apistatus
  const branch = match[3];
  const format = match[4];
  let apiUrl = `/repos/${user}/${repo}/commits`;
  if (branch) {
    apiUrl += `?sha=${branch}`;
  }
  const badgeData = getBadgeData('last commit', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
    badgeData.links = [`https://github.com/${user}/${repo}`];
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const parsedData = JSON.parse(buffer);
      const commitDate = parsedData[0].commit.author.date;
      badgeData.text[1] = formatDate(commitDate);
      badgeData.colorscheme = ageColor(Date.parse(commitDate));
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub languages integration.
camp.route(/^\/github\/languages\/(top|count|code-size)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];
  var user = match[2];
  var repo = match[3];
  var format = match[4];
  const apiUrl = `/repos/${user}/${repo}/languages`;
  var badgeData = getBadgeData('languages', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const parsedData = JSON.parse(buffer);
      var sumBytes = 0;
      switch(type) {
        case 'top':
          var topLanguage = 'language';
          var maxBytes = 0;
          for (const language of Object.keys(parsedData)) {
            const bytes = parseInt(parsedData[language]);
            if (bytes >= maxBytes) {
              maxBytes = bytes;
              topLanguage = language;
            }
            sumBytes += bytes;
          }
          badgeData.text[0] = getLabel(topLanguage, data);
          if (sumBytes === 0) { // eg, empty repo, only .md files, etc.
            badgeData.text[1] = 'none';
            badgeData.colorscheme = 'blue';
          } else {
            badgeData.text[1] = (maxBytes / sumBytes * 100).toFixed(1) + '%'; // eg, 9.1%
          }
          break;
        case 'count':
          badgeData.text[0] = getLabel('languages', data);
          badgeData.text[1] = Object.keys(parsedData).length;
          badgeData.colorscheme = 'blue';
          break;
        case 'code-size':
          for (const language of Object.keys(parsedData)) {
            sumBytes += parseInt(parsedData[language]);
          }
          badgeData.text[0] = getLabel('code size', data);
          badgeData.text[1] = prettyBytes(sumBytes);
          badgeData.colorscheme = 'blue';
          break;
        default:
          throw Error('Unreachable due to regex');
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

//GitHub repository size integration.
camp.route(/^\/github\/repo-size\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];
  var repo = match[2];
  var format = match[3];
  const apiUrl = `/repos/${user}/${repo}`;
  var badgeData = getBadgeData('repo size', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('github', data);
  }
  githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
    if (githubCheckErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const parsedData = JSON.parse(buffer);
      badgeData.text[1] = prettyBytes(parseInt(parsedData.size) * 1024);
      badgeData.colorscheme = 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub commit status integration.
camp.route(/^\/github\/commit-status\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const [, user, repo, branch, commit, format] = match;
  const apiUrl = `/repos/${user}/${repo}/compare/${branch}...${commit}`;
  const badgeData = getBadgeData('commit status', data);
  githubApiProvider.request(request, apiUrl, {}, function(err, res, buffer) {
    if (githubCheckErrorResponse(badgeData, err, res, 'commit or branch not found')) {
      if (res && res.statusCode === 404) {
        try {
          if (JSON.parse(buffer).message.startsWith('No common ancestor between')) {
            badgeData.text[1] = 'no common ancestor';
            badgeData.colorscheme = 'lightgrey';
          }
        } catch(e) {
          badgeData.text[1] = 'invalid';
          badgeData.colorscheme = 'lightgrey';
        }
      }
      sendBadge(format, badgeData);
      return;
    }
    try {
      const parsedData = JSON.parse(buffer);
      const isInBranch = parsedData.status === 'identical' || parsedData.status === 'behind';
      if (isInBranch) {
        badgeData.text[1] = `in ${branch}`;
        badgeData.colorscheme = 'brightgreen';
      } else {
        // status: ahead or diverged
        badgeData.text[1] = `not in ${branch}`;
        badgeData.colorscheme = 'yellow';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Bitbucket issues integration.
camp.route(/^\/bitbucket\/issues(-raw)?\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var isRaw = !!match[1];
  var user = match[2];  // eg, atlassian
  var repo = match[3];  // eg, python-bitbucket
  var format = match[4];
  var apiUrl = 'https://bitbucket.org/api/1.0/repositories/' + user + '/' + repo
    + '/issues/?limit=0&status=new&status=open';

  var badgeData = getBadgeData('issues', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (res.statusCode !== 200) {
        throw Error('Failed to count issues.');
      }
      var data = JSON.parse(buffer);
      var issues = data.count;
      badgeData.text[1] = metric(issues) + (isRaw? '': ' open');
      badgeData.colorscheme = issues ? 'yellow' : 'brightgreen';
      sendBadge(format, badgeData);
    } catch(e) {
      if (res.statusCode === 404) {
        badgeData.text[1] = 'not found';
      } else {
        badgeData.text[1] = 'invalid';
      }
      sendBadge(format, badgeData);
    }
  });
}));

// Bitbucket pull requests integration.
camp.route(/^\/bitbucket\/pr(-raw)?\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var isRaw = !!match[1];
  var user = match[2];  // eg, atlassian
  var repo = match[3];  // eg, python-bitbucket
  var format = match[4];
  var apiUrl = 'https://bitbucket.org/api/2.0/repositories/'
    + encodeURI(user) + '/' + encodeURI(repo)
    + '/pullrequests/?limit=0&state=OPEN';

  var badgeData = getBadgeData('pull requests', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (res.statusCode !== 200) {
        throw Error('Failed to count pull requests.');
      }
      var data = JSON.parse(buffer);
      var pullrequests = data.size;
      badgeData.text[1] = metric(pullrequests) + (isRaw? '': ' open');
      badgeData.colorscheme = (pullrequests > 0)? 'yellow': 'brightgreen';
      sendBadge(format, badgeData);
    } catch(e) {
      if (res.statusCode === 404) {
        badgeData.text[1] = 'not found';
      } else {
        badgeData.text[1] = 'invalid';
      }
      sendBadge(format, badgeData);
    }
  });
}));

// Bitbucket Pipelines integration.
camp.route(/^\/bitbucket\/pipelines\/([^/]+)\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const user = match[1];  // eg, atlassian
  const repo = match[2];  // eg, adf-builder-javascript
  const branch = match[3] || 'master';  // eg, development
  const format = match[4];
  const apiUrl = 'https://api.bitbucket.org/2.0/repositories/'
    + encodeURIComponent(user) + '/' + encodeURIComponent(repo)
    + '/pipelines/?fields=values.state&page=1&pagelen=2&sort=-created_on'
    + '&target.ref_type=BRANCH&target.ref_name=' + encodeURIComponent(branch);

  const badgeData = getBadgeData('build', data);

  request(apiUrl, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const data = JSON.parse(buffer);
      if (!data.values) {
        throw Error('Unexpected response');
      }
      const values = data.values.filter(value => value.state && value.state.name === 'COMPLETED');
      if (values.length > 0) {
        switch (values[0].state.result.name) {
          case 'SUCCESSFUL':
            badgeData.text[1] = 'passing';
            badgeData.colorscheme = 'brightgreen';
            break;
          case 'FAILED':
            badgeData.text[1] = 'failing';
            badgeData.colorscheme = 'red';
            break;
          case 'ERROR':
            badgeData.text[1] = 'error';
            badgeData.colorscheme = 'red';
            break;
          case 'STOPPED':
            badgeData.text[1] = 'stopped';
            badgeData.colorscheme = 'yellow';
            break;
          case 'EXPIRED':
            badgeData.text[1] = 'expired';
            badgeData.colorscheme = 'yellow';
            break;
          default:
            badgeData.text[1] = 'unknown';
        }
      } else {
        badgeData.text[1] = 'never built';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Chef cookbook integration.
camp.route(/^\/cookbook\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var cookbook = match[1]; // eg, chef-sugar
  var format = match[2];
  var apiUrl = 'https://supermarket.getchef.com/api/v1/cookbooks/' + cookbook + '/versions/latest';
  var badgeData = getBadgeData('cookbook', data);

  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    try {
      var data = JSON.parse(buffer);
      var version = data.version;
      badgeData.text[1] = versionText(version);
      badgeData.colorscheme = versionColor(version);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// ReSharper
mapNugetFeedv2({ camp, cache }, 'resharper', 0, function(match) {
  return {
    site: 'resharper',
    feed: 'https://resharper-plugins.jetbrains.com/api/v2',
  };
});

// Chocolatey
mapNugetFeedv2({ camp, cache }, 'chocolatey', 0, function(match) {
  return {
    site: 'chocolatey',
    feed: 'https://www.chocolatey.org/api/v2',
  };
});

// PowerShell Gallery
mapNugetFeedv2({ camp, cache }, 'powershellgallery', 0, function(match) {
  return {
    site: 'powershellgallery',
    feed: 'https://www.powershellgallery.com/api/v2',
  };
});

// NuGet
mapNugetFeed({ camp, cache }, 'nuget', 0, function(match) {
  return {
    site: 'nuget',
    feed: 'https://api.nuget.org/v3',
  };
});

// MyGet
mapNugetFeed({ camp, cache }, '(.+\\.)?myget\\/(.*)', 2, function(match) {
  var tenant = match[1] || 'www.';  // eg. dotnet
  var feed = match[2];
  return {
    site: feed,
    feed: 'https://' + tenant + 'myget.org/F/' + feed + '/api/v3',
  };
});

// Puppet Forge modules
camp.route(/^\/puppetforge\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // either `v`, `dt`, `e` or `f`
  var user = match[2];
  var module = match[3];
  var format = match[4];
  var options = {
    json: true,
    uri: 'https://forgeapi.puppetlabs.com/v3/modules/' + user + '-' + module,
  };
  var badgeData = getBadgeData('puppetforge', data);
  request(options, function dealWithData(err, res, json) {
    if (err != null || (json.length !== undefined && json.length === 0)) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (info === 'v') {
        if (json.current_release) {
          var version = json.current_release.version;
          badgeData.text[1] = versionText(version);
          badgeData.colorscheme = versionColor(version);
        } else {
          badgeData.text[1] = 'none';
          badgeData.colorscheme = 'lightgrey';
        }
      } else if (info === 'dt') {
        var total = json.downloads;
        badgeData.colorscheme = downloadCountColor(total);
        badgeData.text[0] = getLabel('downloads', data);
        badgeData.text[1] = metric(total);
      } else if (info === 'e') {
        var endorsement = json.endorsement;
        if (endorsement === 'approved') {
          badgeData.colorscheme = 'green';
        } else if (endorsement === 'supported') {
          badgeData.colorscheme = 'brightgreen';
        } else {
          badgeData.colorscheme = 'red';
        }
        badgeData.text[0] = getLabel('endorsement', data);
        if (endorsement != null) {
          badgeData.text[1] = endorsement;
        } else {
          badgeData.text[1] = 'none';
        }
      } else if (info === 'f') {
        var feedback = json.feedback_score;
        badgeData.text[0] = getLabel('score', data);
        if (feedback != null) {
          badgeData.text[1] = feedback + '%';
          badgeData.colorscheme = coveragePercentageColor(feedback);
        } else {
          badgeData.text[1] = 'unknown';
          badgeData.colorscheme = 'lightgrey';
        }
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Puppet Forge users
camp.route(/^\/puppetforge\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // either `rc` or `mc`
  var user = match[2];
  var format = match[3];
  var options = {
    json: true,
    uri: 'https://forgeapi.puppetlabs.com/v3/users/' + user,
  };
  var badgeData = getBadgeData('puppetforge', data);
  request(options, function dealWithData(err, res, json) {
    if (err != null || (json.length !== undefined && json.length === 0)) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (info === 'rc') {
        var releases = json.release_count;
        badgeData.colorscheme = floorCountColor(releases, 10, 50, 100);
        badgeData.text[0] = getLabel('releases', data);
        badgeData.text[1] = metric(releases);
      } else if (info === 'mc') {
        var modules = json.module_count;
        badgeData.colorscheme = floorCountColor(modules, 5, 10, 50);
        badgeData.text[0] = getLabel('modules', data);
        badgeData.text[1] = metric(modules);
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Jenkins build status integration
camp.route(/^\/jenkins(?:-ci)?\/s\/(http(?:s)?)\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[1];  // http(s)
  var host = match[2];  // example.org:8080
  var job = match[3];  // folder/job
  var format = match[4];
  var options = {
    json: true,
    uri: scheme + '://' + host + '/job/' + job + '/api/json?tree=color',
  };
  if (job.indexOf('/') > -1 ) {
    options.uri = scheme + '://' + host + '/' + job + '/api/json?tree=color';
  }

  if (serverSecrets && serverSecrets.jenkins_user) {
    options.auth = {
      user: serverSecrets.jenkins_user,
      pass: serverSecrets.jenkins_pass,
    };
  }

  var badgeData = getBadgeData('build', data);
  request(options, function(err, res, json) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    try {
      if (json.color === 'blue' || json.color === 'green') {
        badgeData.colorscheme = 'brightgreen';
        badgeData.text[1] = 'passing';
      } else if (json.color === 'red') {
        badgeData.colorscheme = 'red';
        badgeData.text[1] = 'failing';
      } else if (json.color === 'yellow') {
        badgeData.colorscheme = 'yellow';
        badgeData.text[1] = 'unstable';
      } else if (json.color === 'grey' || json.color === 'disabled'
          || json.color === 'aborted' || json.color === 'notbuilt') {
        badgeData.colorscheme = 'lightgrey';
        badgeData.text[1] = 'not built';
      } else {
        badgeData.colorscheme = 'lightgrey';
        badgeData.text[1] = 'building';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Jenkins tests integration
camp.route(/^\/jenkins(?:-ci)?\/t\/(http(?:s)?)\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[1];  // http(s)
  var host = match[2];  // example.org:8080
  var job = match[3];  // folder/job
  var format = match[4];
  var options = {
    json: true,
    uri: scheme + '://' + host + '/job/' + job
      + '/lastBuild/api/json?tree=' + encodeURIComponent('actions[failCount,skipCount,totalCount]'),
  };
  if (job.indexOf('/') > -1 ) {
    options.uri = scheme + '://' + host + '/' + job
      + '/lastBuild/api/json?tree=' + encodeURIComponent('actions[failCount,skipCount,totalCount]');
  }

  if (serverSecrets && serverSecrets.jenkins_user) {
    options.auth = {
      user: serverSecrets.jenkins_user,
      pass: serverSecrets.jenkins_pass,
    };
  }

  var badgeData = getBadgeData('tests', data);
  request(options, function(err, res, json) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    try {
      var testsObject = json.actions.filter(function (obj) {
        return obj.hasOwnProperty('failCount');
      })[0];
      if (testsObject === undefined) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      var successfulTests = testsObject.totalCount
        - (testsObject.failCount + testsObject.skipCount);
      var percent = successfulTests / testsObject.totalCount;
      badgeData.text[1] = successfulTests + ' / ' + testsObject.totalCount;
      if (percent === 1) {
        badgeData.colorscheme = 'brightgreen';
      } else if (percent === 0) {
        badgeData.colorscheme = 'red';
      } else {
        badgeData.colorscheme = 'yellow';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Jenkins coverage integration (cobertura + jacoco)
camp.route(/^\/jenkins(?:-ci)?\/(c|j)\/(http(?:s)?)\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const type = match[1];    // c - cobertura | j - jacoco
  const scheme = match[2];  // http(s)
  const host = match[3];    // example.org:8080
  const job = match[4];     // folder/job
  const format = match[5];
  const options = {
    json: true,
    uri: `${scheme}://${host}/job/${job}/`,
  };

  if (job.indexOf('/') > -1 ) {
    options.uri = `${scheme}://${host}/${job}/`;
  }

  switch (type) {
    case 'c':
      options.uri += 'lastBuild/cobertura/api/json?tree=results[elements[name,denominator,numerator,ratio]]';
      break;
    case 'j':
      options.uri += 'lastBuild/jacoco/api/json?tree=instructionCoverage[covered,missed,percentage,total]';
      break;
  }

  if (serverSecrets && serverSecrets.jenkins_user) {
    options.auth = {
      user: serverSecrets.jenkins_user,
      pass: serverSecrets.jenkins_pass,
    };
  }

  const badgeData = getBadgeData('coverage', data);
  request(options, function(err, res, json) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }

    try {
      const coverageObject = json.instructionCoverage;
      if (coverageObject === undefined) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      const coverage = coverageObject.percentage;
      if (isNaN(coverage)) {
        badgeData.text[1] = 'unknown';
        sendBadge(format, badgeData);
        return;
      }
      badgeData.text[1] = coverage.toFixed(0) + '%';
      badgeData.colorscheme = coveragePercentageColor(coverage);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Jenkins Plugins version integration
camp.route(/^\/jenkins\/plugin\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var pluginId = match[1];  // e.g. blueocean
  var format = match[2];
  var badgeData = getBadgeData('plugin', data);
  regularUpdate({
    url: 'https://updates.jenkins-ci.org/current/update-center.actual.json',
    intervalMillis: 4 * 3600 * 1000,
    scraper: json => Object.keys(json.plugins).reduce((previous, current) => {
      previous[current] = json.plugins[current].version;
      return previous;
    }, {}),
  }, (err, versions) => {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      try {
        var version = versions[pluginId];
        if (version === undefined) {
          throw Error('Plugin not found!');
        }
        badgeData.text[1] = versionText(version);
        badgeData.colorscheme = versionColor(version);
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'not found';
        sendBadge(format, badgeData);
      }
    });
}));

// Ansible integration
camp.route(/^\/ansible\/role\/(?:(d)\/)?(\d+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const type = match[1];      // eg d or nothing
  const roleId = match[2];    // eg 3078
  const format = match[3];
  const options = {
    json: true,
    uri: 'https://galaxy.ansible.com/api/v1/roles/' + roleId + '/',
  };
  const badgeData = getBadgeData('role', data);
  request(options, function(err, res, json) {
    if (res && (res.statusCode === 404 || json === undefined || json.state === null)) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (type === 'd') {
        badgeData.text[0] = getLabel('role downloads', data);
        badgeData.text[1] = metric(json.download_count);
        badgeData.colorscheme = 'blue';
      } else {
        badgeData.text[1] = json.summary_fields.namespace.name + '.' + json.name;
        badgeData.colorscheme = 'blue';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'errored';
      sendBadge(format, badgeData);
    }
  });
}));

// Codeship.io integration
camp.route(/^\/codeship\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectId = match[1];  // eg, `ab123456-00c0-0123-42de-6f98765g4h32`.
  var format = match[3];
  var branch = match[2];
  var options = {
    method: 'GET',
    uri: 'https://codeship.com/projects/' + projectId + '/status' + (branch != null ? '?branch=' + branch : ''),
  };
  var badgeData = getBadgeData('build', data);
  request(options, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var statusMatch = res.headers['content-disposition']
                           .match(/filename="status_(.+)\./);
      if (!statusMatch) {
        badgeData.text[1] = 'unknown';
        sendBadge(format, badgeData);
        return;
      }

      switch (statusMatch[1]) {
        case 'success':
          badgeData.text[1] = 'passing';
          badgeData.colorscheme = 'brightgreen';
          break;
        case 'projectnotfound':
          badgeData.text[1] = 'not found';
          break;
        case 'branchnotfound':
          badgeData.text[1] = 'branch not found';
          break;
        case 'testing':
        case 'waiting':
        case 'initiated':
          badgeData.text[1] = 'pending';
          break;
        case 'error':
        case 'infrastructure_failure':
          badgeData.text[1] = 'failing';
          badgeData.colorscheme = 'red';
          break;
        case 'stopped':
        case 'ignored':
        case 'blocked':
          badgeData.text[1] = 'not built';
          break;
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Magnum CI integration - deprecated as of July 2018
camp.route(/^\/magnumci\/ci\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const format = match[3];
  const badgeData = getDeprecatedBadge('magnum ci', data);
  sendBadge(format, badgeData);
}));

// Maven-Central artifact version integration
// (based on repo1.maven.org rather than search.maven.org because of #846)
camp.route(/^\/maven-central\/v\/([^/]*)\/([^/]*)(?:\/([^/]*))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var groupId = match[1]; // eg, `com.google.inject`
  var artifactId = match[2]; // eg, `guice`
  var versionPrefix = match[3] || ''; // eg, `1.`
  var format = match[4] || 'gif'; // eg, `svg`
  var metadataUrl = 'http://repo1.maven.org/maven2'
    + '/' + encodeURIComponent(groupId).replace(/\./g, '/')
    + '/' + encodeURIComponent(artifactId)
    + '/maven-metadata.xml';
  var badgeData = getBadgeData('maven-central', data);
  request(metadataUrl, { headers: { 'Accept': 'text/xml' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    xml2js.parseString(buffer.toString(), function (err, data) {
      if (err != null) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
        return;
      }
      try {
        var versions = data.metadata.versioning[0].versions[0].version.reverse();
        var version = versions.find(function(version){
          return version.indexOf(versionPrefix) === 0;
        });
        badgeData.text[1] = versionText(version);
        badgeData.colorscheme = versionColor(version);
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  });
}));

// standalone sonatype nexus installation
// API pattern:
//   /nexus/(r|s|<repo-name>)/(http|https)/<nexus.host>[:port][/<entry-path>]/<group>/<artifact>[:k1=v1[:k2=v2[...]]].<format>
// for /nexus/[rs]/... pattern, use the search api of the nexus server, and
// for /nexus/<repo-name>/... pattern, use the resolve api of the nexus server.
camp.route(/^\/nexus\/(r|s|[^/]+)\/(https?)\/((?:[^/]+)(?:\/[^/]+)?)\/([^/]+)\/([^/:]+)(:.+)?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];                           // r | s | repo-name
  var scheme = match[2];                         // http | https
  var host = match[3];                           // eg, `nexus.example.com`
  var groupId = encodeURIComponent(match[4]);    // eg, `com.google.inject`
  var artifactId = encodeURIComponent(match[5]); // eg, `guice`
  var queryOpt = (match[6] || '').replace(/:/g, '&'); // eg, `&p=pom&c=doc`
  var format = match[7];

  var badgeData = getBadgeData('nexus', data);

  var apiUrl = scheme + '://' + host
               + ((repo ==  'r' || repo == 's')
                 ? ('/service/local/lucene/search?g=' + groupId + '&a=' + artifactId + queryOpt)
                 : ('/service/local/artifact/maven/resolve?r=' + repo + '&g=' + groupId + '&a=' + artifactId + '&v=LATEST' + queryOpt));

  request(apiUrl, { headers: { 'Accept': 'application/json' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    } else if (res && (res.statusCode === 404)) {
      badgeData.text[1] = 'no-artifact';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var parsed = JSON.parse(buffer);
      var version = '0';
      switch (repo) {
        case 'r':
          if (parsed.data.length === 0) {
            badgeData.text[1] = 'no-artifact';
            sendBadge(format, badgeData);
            return;
          }
          version = parsed.data[0].latestRelease;
          break;
        case 's':
          if (parsed.data.length === 0) {
            badgeData.text[1] = 'no-artifact';
            sendBadge(format, badgeData);
            return;
          }
          // only want to match 1.2.3-SNAPSHOT style versions, which may not always be in
          // 'latestSnapshot' so check 'version' as well before continuing to next entry
          parsed.data.every(function(artifact) {
             if (isNexusSnapshotVersion(artifact.latestSnapshot)) {
                version = artifact.latestSnapshot;
                return;
             }
             if (isNexusSnapshotVersion(artifact.version)) {
                version = artifact.version;
                return;
             }
             return true;
          });
          break;
        default:
          version = parsed.data.baseVersion || parsed.data.version;
          break;
      }
      if (version !== '0') {
        badgeData.text[1] = versionText(version);
        badgeData.colorscheme = versionColor(version);
      } else {
        badgeData.text[1] = 'undefined';
        badgeData.colorscheme = 'orange';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Bower version integration.
camp.route(/^\/bower\/(v|vpre)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache((data, match, sendBadge, request) => {
  const reqType = match[1];
  const repo = match[2];  // eg, `bootstrap`.
  const format = match[3];
  const badgeData = getBadgeData('bower', data);

  // API doc: https://libraries.io/api#project
  const options = {
    method: 'GET',
    json: true,
    uri: `https://libraries.io/api/bower/${repo}`,
  };
  if (serverSecrets && serverSecrets.libraries_io_api_key) {
    options.qs = {
      api_key: serverSecrets.libraries_io_api_key,
    };
  }
  request(options, (err, res, data) => {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    if(res.statusCode !== 200) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    try {
      //if reqType is `v`, then stable release number, if `vpre` then latest release
      const version = reqType == 'v' ? data.latest_stable_release.name : data.latest_release_number;
      badgeData.text[1] = versionText(version);
      badgeData.colorscheme = versionColor(version);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'no releases';
      sendBadge(format, badgeData);
    }
  });
}));

// Bower license integration.
camp.route(/^\/bower\/l\/(.*)\.(svg|png|gif|jpg|json)$/,
cache((data, match, sendBadge, request) => {
  const repo = match[1];  // eg, `bootstrap`.
  const format = match[2];
  const badgeData = getBadgeData('bower', data);
  // API doc: https://libraries.io/api#project
  const options = {
    method: 'GET',
    json: true,
    uri: `https://libraries.io/api/bower/${repo}`,
  };
  if (serverSecrets && serverSecrets.libraries_io_api_key) {
    options.qs = {
      api_key: serverSecrets.libraries_io_api_key,
    };
  }
  request(options, (err, res, data) => {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      const license = data.normalized_licenses[0];
      badgeData.text[1] = license;
      badgeData.colorscheme = 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Wheelmap integration.
camp.route(/^\/wheelmap\/a\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var nodeId = match[1];  // eg, `2323004600`.
  var format = match[2];
  var options = {
    method: 'GET',
    json: true,
    uri: 'http://wheelmap.org/nodes/' + nodeId + '.json',
  };
  var badgeData = getBadgeData('wheelmap', data);
  request(options, function(err, res, json) {
    try {
      var accessibility = json.node.wheelchair;
      badgeData.text[1] = accessibility;
      if (accessibility === 'yes') {
        badgeData.colorscheme = 'brightgreen';
      } else if (accessibility === 'limited') {
        badgeData.colorscheme = 'yellow';
      } else if (accessibility === 'no') {
        badgeData.colorscheme = 'red';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'void';
      sendBadge(format, badgeData);
    }
  });
}));

// wordpress plugin version integration.
// example: https://img.shields.io/wordpress/plugin/v/akismet.svg for https://wordpress.org/plugins/akismet
camp.route(/^\/wordpress\/plugin\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var plugin = match[1];  // eg, `akismet`.
  var format = match[2];
  var apiUrl = 'http://api.wordpress.org/plugins/info/1.0/' + plugin + '.json';
  var badgeData = getBadgeData('plugin', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var version = data.version;
      badgeData.text[1] = versionText(version);
      badgeData.colorscheme = versionColor(version);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// wordpress plugin downloads integration.
// example: https://img.shields.io/wordpress/plugin/dt/akismet.svg for https://wordpress.org/plugins/akismet
camp.route(/^\/wordpress\/plugin\/dt\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var plugin = match[1];  // eg, `akismet`.
  var format = match[2];
  var apiUrl = 'http://api.wordpress.org/plugins/info/1.0/' + plugin + '.json';
  var badgeData = getBadgeData('downloads', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var total = JSON.parse(buffer).downloaded;
      badgeData.text[1] = metric(total);
      if (total === 0) {
        badgeData.colorscheme = 'red';
      } else if (total < 100) {
        badgeData.colorscheme = 'yellow';
      } else if (total < 1000) {
        badgeData.colorscheme = 'yellowgreen';
      } else if (total < 10000) {
        badgeData.colorscheme = 'green';
      } else {
        badgeData.colorscheme = 'brightgreen';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// wordpress plugin rating integration.
// example: https://img.shields.io/wordpress/plugin/r/akismet.svg for https://wordpress.org/plugins/akismet
camp.route(/^\/wordpress\/plugin\/r\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var plugin = match[1];  // eg, `akismet`.
  var format = match[2];
  var apiUrl = 'http://api.wordpress.org/plugins/info/1.0/' + plugin + '.json';
  var badgeData = getBadgeData('rating', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var rating = parseInt(JSON.parse(buffer).rating);
      rating = rating / 100 * 5;
      badgeData.text[1] = starRating(rating);
      if (rating === 0) {
        badgeData.colorscheme = 'red';
      } else if (rating < 2) {
        badgeData.colorscheme = 'yellow';
      } else if (rating < 3) {
        badgeData.colorscheme = 'yellowgreen';
      } else if (rating < 4) {
        badgeData.colorscheme = 'green';
      } else {
        badgeData.colorscheme = 'brightgreen';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// wordpress version support integration.
// example: https://img.shields.io/wordpress/v/akismet.svg for https://wordpress.org/plugins/akismet
camp.route(/^\/wordpress\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var plugin = match[1];  // eg, `akismet`.
  var format = match[2];
  var apiUrl = 'http://api.wordpress.org/plugins/info/1.0/' + plugin + '.json';
  var badgeData = getBadgeData('wordpress', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (data.tested) {
        var testedVersion = data.tested.replace(/[^0-9.]/g,'');
        badgeData.text[1] = testedVersion + ' tested';
        var coreUrl = 'https://api.wordpress.org/core/version-check/1.7/';
        request(coreUrl, function(err, res, response) {
          try {
            var versions = JSON.parse(response).offers.map(function(v) {
              return v.version;
            });
            if (err != null) { sendBadge(format, badgeData); return; }
            var svTestedVersion = testedVersion.split('.').length == 2 ? testedVersion += '.0' : testedVersion;
            var svVersion = versions[0].split('.').length == 2 ? versions[0] += '.0' : versions[0];
            if (testedVersion == versions[0] || semver.gtr(svTestedVersion, svVersion)) {
              badgeData.colorscheme = 'brightgreen';
            } else if (versions.indexOf(testedVersion) != -1) {
              badgeData.colorscheme = 'orange';
            } else {
              badgeData.colorscheme = 'yellow';
            }
            sendBadge(format, badgeData);
          } catch(e) {
            badgeData.text[1] = 'invalid';
            sendBadge(format, badgeData);
          }
        });
      } else {
        sendBadge(format, badgeData);
      }
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// wordpress theme rating integration.
// example: https://img.shields.io/wordpress/theme/r/hestia.svg for https://wordpress.org/themes/hestia
camp.route(/^\/wordpress\/theme\/r\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var queryParams = {
    'action': 'theme_information',
    'request[slug]': match[1],  // eg, `hestia`.
  };
  var format = match[2];
  var apiUrl = 'https://api.wordpress.org/themes/info/1.1/?' + queryString.stringify(queryParams);
  var badgeData = getBadgeData('rating', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var rating = parseInt(JSON.parse(buffer).rating);
      rating = rating / 100 * 5;
      badgeData.text[1] = starRating(rating);
      if (rating === 0) {
        badgeData.colorscheme = 'red';
      } else if (rating < 2) {
        badgeData.colorscheme = 'yellow';
      } else if (rating < 3) {
        badgeData.colorscheme = 'yellowgreen';
      } else if (rating < 4) {
        badgeData.colorscheme = 'green';
      } else {
        badgeData.colorscheme = 'brightgreen';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// wordpress theme download integration.
// example: https://img.shields.io/wordpress/theme/dt/hestia.svg for https://wordpress.org/themes/hestia
camp.route(/^\/wordpress\/theme\/dt\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var queryParams = {
    'action': 'theme_information',
    'request[slug]': match[1], // eg, `hestia`.
  };
  var format = match[2];
  var apiUrl = 'https://api.wordpress.org/themes/info/1.1/?' + queryString.stringify(queryParams);
  var badgeData = getBadgeData('downloads', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var downloads = JSON.parse(buffer).downloaded;
      badgeData.text[1] = metric(downloads);
      badgeData.colorscheme = downloadCountColor(downloads);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// SourceForge integration.
camp.route(/^\/sourceforge\/(dt|dm|dw|dd)\/([^/]*)\/?(.*).(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const info = match[1];      // eg, 'dm'
  const project = match[2];   // eg, 'sevenzip`.
  const folder = match[3];
  const format = match[4];
  let apiUrl = 'http://sourceforge.net/projects/' + project + '/files/' + folder + '/stats/json';
  const badgeData = getBadgeData('sourceforge', data);
  let time_period, start_date;
  badgeData.text[0] = getLabel('downloads', data);
  // get yesterday since today is incomplete
  const end_date = moment().subtract(24, 'hours');
  switch (info.charAt(1)) {
    case 'm':
      start_date = moment(end_date).subtract(30, 'days');
      time_period = '/month';
      break;
    case 'w':
      start_date = moment(end_date).subtract(6, 'days');  // 6, since date range is inclusive
      time_period = '/week';
      break;
    case 'd':
      start_date = end_date;
      time_period = '/day';
      break;
    case 't':
      start_date = moment(0);
      time_period = '';
      break;
  }
  apiUrl += '?start_date=' + start_date.format("YYYY-MM-DD") + '&end_date=' + end_date.format("YYYY-MM-DD");
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      const data = JSON.parse(buffer);
      const downloads = data.total;
      badgeData.text[1] = metric(downloads) + time_period;
      badgeData.colorscheme = downloadCountColor(downloads);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Requires.io status integration
camp.route(/^\/requires\/([^/]+\/[^/]+\/[^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, `github/celery/celery`.
  var branch = match[2];
  var format = match[3];
  var uri = 'https://requires.io/api/v1/status/' + userRepo;
  if (branch != null) {
    uri += '?branch=' + branch;
  }
  var options = {
    method: 'GET',
    uri: uri,
  };
  var badgeData = getBadgeData('requirements', data);
  request(options, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const json = JSON.parse(buffer);
      if (json.status === 'up-to-date') {
        badgeData.text[1] = 'up to date';
        badgeData.colorscheme = 'brightgreen';
      } else if (json.status === 'outdated') {
        badgeData.text[1] = 'outdated';
        badgeData.colorscheme = 'yellow';
      } else if (json.status === 'insecure') {
        badgeData.text[1] = 'insecure';
        badgeData.colorscheme = 'red';
      } else {
        badgeData.text[1] = 'unknown';
        badgeData.colorscheme = 'lightgrey';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
  });
}));

//vscode-marketplace download/version/rating integration
camp.route(/^\/vscode-marketplace\/(d|v|r|stars)\/(.*)\.(svg|png|gif|jpg|json)$/,
  cache(function (data, match, sendBadge, request) {
    let reqType = match[1]; // eg, d/v/r
    let repo = match[2];  // eg, `ritwickdey.LiveServer`.
    let format = match[3];

    let badgeData = getBadgeData('vscode-marketplace', data); //temporary name
    let options = getVscodeApiReqOptions(repo);

    request(options, function (err, res, buffer) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }

      try {
        switch (reqType) {
          case 'd':
            badgeData.text[0] = getLabel('downloads', data);
            var count = getVscodeStatistic(buffer, 'install');
            badgeData.text[1] = metric(count);
            badgeData.colorscheme = downloadCountColor(count);
            break;
          case 'r':
            badgeData.text[0] = getLabel('rating', data);
            var rate = getVscodeStatistic(buffer, 'averagerating').toFixed(2);
            var totalrate = getVscodeStatistic(buffer, 'ratingcount');
            badgeData.text[1] = rate + '/5 (' + totalrate + ')';
            badgeData.colorscheme = floorCountColor(rate, 2, 3, 4);
            break;
          case 'stars':
            badgeData.text[0] = getLabel('rating', data);
            var rating = getVscodeStatistic(buffer, 'averagerating').toFixed(2);
            badgeData.text[1] = starRating(rating);
            badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);
            break;
          case 'v':
            badgeData.text[0] = getLabel('visual studio marketplace', data);
            var version = buffer.results[0].extensions[0].versions[0].version;
            badgeData.text[1] = versionText(version);
            badgeData.colorscheme = versionColor(version);
            break;
        }
        sendBadge(format, badgeData);
      } catch (e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }

    });
  })
);

// Eclipse Marketplace integration.
camp.route(/^\/eclipse-marketplace\/(dt|dm|v|favorites|last-update)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];
  var project = match[2];
  var format = match[3];
  var apiUrl = 'https://marketplace.eclipse.org/content/' + project + '/api/p';
  var badgeData = getBadgeData('eclipse marketplace', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    xml2js.parseString(buffer.toString(), function (parseErr, parsedData) {
      if (parseErr != null) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
        return;
      }
      try {
        const projectNode = parsedData.marketplace.node[0];
        switch (type) {
          case 'dt':
            badgeData.text[0] = getLabel('downloads', data);
            var downloads = parseInt(projectNode.installstotal[0]);
            badgeData.text[1] = metric(downloads);
            badgeData.colorscheme = downloadCountColor(downloads);
            break;
          case 'dm':
            badgeData.text[0] = getLabel('downloads', data);
            var monthlydownloads = parseInt(projectNode.installsrecent[0]);
            badgeData.text[1] = metric(monthlydownloads) + '/month';
            badgeData.colorscheme = downloadCountColor(monthlydownloads);
            break;
          case 'v':
            badgeData.text[1] = versionText(projectNode.version[0]);
            badgeData.colorscheme = versionColor(projectNode.version[0]);
            break;
          case 'favorites':
            badgeData.text[0] = getLabel('favorites', data);
            badgeData.text[1] = parseInt(projectNode.favorited[0]);
            badgeData.colorscheme = 'brightgreen';
            break;
          case 'last-update':
            var date = 1000 * parseInt(projectNode.changed[0]);
            badgeData.text[0] = getLabel('updated', data);
            badgeData.text[1] = formatDate(date);
            badgeData.colorscheme = ageColor(Date.parse(date));
            break;
          default:
            throw Error('Unreachable due to regex');
        }
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  });
}));

camp.route(/^\/dockbit\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\.(svg|png|gif|jpg|json)$/,
cache({
  queryParams: ['token'],
  handler: (data, match, sendBadge, request) => {
    const org      = match[1];
    const pipeline = match[2];
    const format   = match[3];

    const token     = data.token;
    const badgeData = getBadgeData('deploy', data);
    const apiUrl    = `https://dockbit.com/${org}/${pipeline}/status/${token}`;

    var dockbitStates = {
      success:  '#72BC37',
      failure:  '#F55C51',
      error:    '#F55C51',
      working:  '#FCBC41',
      pending:  '#CFD0D7',
      rejected: '#CFD0D7',
    };

    request(apiUrl, { json: true }, function(err, res, data) {
      try {
        if (res && (res.statusCode === 404 || data.state === null)) {
          badgeData.text[1] = 'not found';
          sendBadge(format, badgeData);
          return;
        }

        if (!res || err !== null || res.statusCode !== 200) {
          badgeData.text[1] = 'inaccessible';
          sendBadge(format, badgeData);
          return;
        }

        badgeData.text[1] = data.state;
        badgeData.colorB = dockbitStates[data.state];

        sendBadge(format, badgeData);
      }
      catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  },
}));

camp.route(/^\/bitrise\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache({
  queryParams: ['token'],
  handler: (data, match, sendBadge, request) => {
    const appId = match[1];
    const branch = match[2];
    const format = match[3];
    const token = data.token;
    const badgeData = getBadgeData('bitrise', data);
    let apiUrl = 'https://app.bitrise.io/app/' + appId + '/status.json?token=' + token;
    if (typeof branch !== 'undefined') {
      apiUrl += '&branch=' + branch;
    }

    const statusColorScheme = {
      success: 'brightgreen',
      error: 'red',
      unknown: 'lightgrey',
    };

    request(apiUrl, { json: true }, function(err, res, data) {
      try {
        if (!res || err !== null || res.statusCode !== 200) {
          badgeData.text[1] = 'inaccessible';
          sendBadge(format, badgeData);
          return;
        }

        badgeData.text[1] = data.status;
        badgeData.colorscheme = statusColorScheme[data.status];

        sendBadge(format, badgeData);
      }
      catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  },
}));

// CircleCI build integration.
// https://circleci.com/api/v1/project/BrightFlair/PHP.Gt?circle-token=0a5143728784b263d9f0238b8d595522689b3af2&limit=1&filter=completed
camp.route(/^\/circleci\/(?:token\/(\w+))?[+/]?project\/(?:(github|bitbucket)\/)?([^/]+\/[^/]+)(?:\/(.*))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const token = match[1];
  const type = match[2] || 'github'; // github OR bitbucket
  const userRepo = match[3];  // eg, `RedSparr0w/node-csgo-parser`.
  const branch = match[4];
  const format = match[5];

  // Base API URL
  let apiUrl = 'https://circleci.com/api/v1.1/project/' + type + '/' + userRepo;

  // Query Params
  var queryParams = {};
  queryParams['limit'] = 1;
  queryParams['filter'] = 'completed';

  // Custom Banch if present
  if (branch != null) {
    apiUrl += "/tree/" + branch;
  }

  // Append Token to Query Params if present
  if (token) {
    queryParams['circle-token'] = token;
  }

  // Apprend query params to API URL
  apiUrl += '?' + queryString.stringify(queryParams);

  const badgeData = getBadgeData('build', data);
  request(apiUrl, { json:true }, function(err, res, data) {
    if (checkErrorResponse(badgeData, err, res, { 404: 'project not found' })) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (data.message !== undefined){
        badgeData.text[1] = data.message;
        sendBadge(format, badgeData);
        return;
      }

      let passCount = 0;
      let status;
      for (let i=0; i<data.length; i++) {
        status = data[i].status;
        if (['success', 'fixed'].includes(status)) {
          passCount++;
        } else if (status === 'failed') {
          badgeData.colorscheme = 'red';
          badgeData.text[1] = 'failed';
          sendBadge(format, badgeData);
          return;
        } else if (['no_tests', 'scheduled', 'not_run'].includes(status)) {
          badgeData.colorscheme = 'yellow';
          badgeData.text[1] = status.replace('_', ' ');
          sendBadge(format, badgeData);
          return;
        } else {
          badgeData.text[1] = status.replace('_', ' ');
          sendBadge(format, badgeData);
          return;
        }
      }

      if (passCount === data.length) {
        badgeData.colorscheme = 'brightgreen';
        badgeData.text[1] = 'passing';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// CPAN integration.
camp.route(/^\/cpan\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // either `v` or `l`
  var pkg = match[2]; // eg, Config-Augeas
  var format = match[3];
  var badgeData = getBadgeData('cpan', data);
  var url = 'https://fastapi.metacpan.org/v1/release/'+pkg;
  request(url, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);

      if (info === 'v') {
        var version = data.version;
        badgeData.text[1] = versionText(version);
        badgeData.colorscheme = versionColor(version);
      } else if (info === 'l') {
        var license = data.license[0];
        badgeData.text[1] = license;
        badgeData.colorscheme = 'blue';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// CRAN/METACRAN integration.
camp.route(/^\/cran\/([vl])\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(queryParams, match, sendBadge, request) {
  var info = match[1]; // either `v` or `l`
  var pkg = match[2]; // eg, devtools
  var format = match[3];
  var url = 'http://crandb.r-pkg.org/' + pkg;
  var badgeData = getBadgeData('cran', queryParams);
  request(url, function (err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    if (res.statusCode === 404) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);

      if (info === 'v') {
        var version = data.Version;
        badgeData.text[1] = versionText(version);
        badgeData.colorscheme = versionColor(version);
        sendBadge(format, badgeData);
      } else if (info === 'l') {
        badgeData.text[0] = getLabel('license', queryParams);
        var license = data.License;
        if (license) {
          badgeData.text[1] = license;
          badgeData.colorscheme = 'blue';
        } else {
          badgeData.text[1] = 'unknown';
        }
        sendBadge(format, badgeData);
      } else {
        throw Error('Unreachable due to regex');
      }
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));


// CTAN integration.
camp.route(/^\/ctan\/([vl])\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // either `v` or `l`
  var pkg = match[2]; // eg, tex
  var format = match[3];
  var url = 'http://www.ctan.org/json/pkg/' + pkg;
  var badgeData = getBadgeData('ctan', data);
  request(url, function (err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    if (res.statusCode === 404) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var parsedData = JSON.parse(buffer);

      if (info === 'v') {
        var version = parsedData.version.number;
        badgeData.text[1] = versionText(version);
        badgeData.colorscheme = versionColor(version);
        sendBadge(format, badgeData);
      } else if (info === 'l') {
        badgeData.text[0] = getLabel('license', data);
        var license = parsedData.license;
        if (Array.isArray(license) && license.length > 0) {
          // API returns licenses inconsistently ordered, so fix the order.
          badgeData.text[1] = license.sort().join(',');
          badgeData.colorscheme = 'blue';
        } else {
          badgeData.text[1] = 'unknown';
        }
        sendBadge(format, badgeData);
      } else {
        throw Error('Unreachable due to regex');
      }
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });}
));

// DUB download integration
camp.route(/^\/dub\/(dd|dw|dm|dt)\/([^/]+)(?:\/([^/]+))?\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var info = match[1]; // downloads (dd - daily, dw - weekly, dm - monthly, dt - total)
  var pkg = match[2]; // package name, e.g. vibe-d
  var version = match[3]; // version (1.2.3 or latest)
  var format = match[4];
  var apiUrl = 'https://code.dlang.org/api/packages/'+pkg;
  if (version) {
    apiUrl += '/' + version;
  }
  apiUrl += '/stats';
  var badgeData = getBadgeData('dub', data);
  request(apiUrl, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var parsedData = JSON.parse(buffer);
      if (info.charAt(0) === 'd') {
        badgeData.text[0] = getLabel('downloads', data);
        var downloads;
        switch (info.charAt(1)) {
          case 'm':
            downloads = parsedData.downloads.monthly;
            badgeData.text[1] = metric(downloads) + '/month';
            break;
          case 'w':
            downloads = parsedData.downloads.weekly;
            badgeData.text[1] = metric(downloads) + '/week';
            break;
          case 'd':
            downloads = parsedData.downloads.daily;
            badgeData.text[1] = metric(downloads) + '/day';
            break;
          case 't':
            downloads = parsedData.downloads.total;
            badgeData.text[1] = metric(downloads);
            break;
        }
        if (version) {
            badgeData.text[1] += ' ' + versionText(version);
        }
        badgeData.colorscheme = downloadCountColor(downloads);
        sendBadge(format, badgeData);
      }
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// DUB license and version integration
camp.route(/^\/dub\/(v|l)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var info = match[1];  // (v - version, l - license)
  var pkg = match[2];  // package name, e.g. vibe-d
  var format = match[3];
  var apiUrl = 'https://code.dlang.org/api/packages/' + pkg;
  if (info === 'v') {
    apiUrl += '/latest';
  } else if (info === 'l') {
    apiUrl += '/latest/info';
  }
  var badgeData = getBadgeData('dub', data);
  request(apiUrl, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var parsedData = JSON.parse(buffer);
      if (info === 'v') {
        badgeData.text[1] = versionText(parsedData);
        badgeData.colorscheme = versionColor(parsedData);
        sendBadge(format, badgeData);
      } else if (info == 'l') {
        var license = parsedData.info.license;
        badgeData.text[0] = getLabel('license', data);
        if (license == null) {
          badgeData.text[1] = 'Unknown';
        } else {
          badgeData.text[1] = license;
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      }
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Docker Hub stars integration.
camp.route(/^\/docker\/stars\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, mashape
  var repo = match[2];  // eg, kong
  var format = match[3];
  if (user === '_') {
    user = 'library';
  }
  var path = user + '/' + repo;
  var url = 'https://hub.docker.com/v2/repositories/' + path + '/stars/count/';
  var badgeData = getBadgeData('docker stars', data);
  request(url, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res, { 404: 'repo not found' })) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const stars = parseInt(buffer, 10);
      if (Number.isNaN(stars)) {
        throw Error('Unexpected response.');
      }
      badgeData.text[1] = metric(stars);
      setBadgeColor(badgeData, data.colorB || '066da5');
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Docker Hub pulls integration.
camp.route(/^\/docker\/pulls\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, mashape
  var repo = match[2];  // eg, kong
  var format = match[3];
  if (user === '_') {
    user = 'library';
  }
  var path = user + '/' + repo;
  var url = 'https://hub.docker.com/v2/repositories/' + path;
  var badgeData = getBadgeData('docker pulls', data);
  request(url, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res, { 404: 'repo not found' })) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var parseData = JSON.parse(buffer);
      var pulls = parseData.pull_count;
      badgeData.text[1] = metric(pulls);
      setBadgeColor(badgeData, data.colorB || '066da5');
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));


// Buildkite integration.
camp.route(/^\/buildkite\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var identifier = match[1];  // eg, 3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489
  var branch = match[2] || 'master';  // Defaults to master if not specified
  var format = match[3];

  var url = 'https://badge.buildkite.com/' + identifier + '.json?branch=' + branch;
  var badgeData = getBadgeData('build', data);

  request(url, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }

    try {
      var data = JSON.parse(buffer);
      var status = data.status;
      if (status === 'passing') {
        badgeData.text[1] = 'passing';
        badgeData.colorscheme = 'green';
      } else if (status === 'failing') {
        badgeData.text[1] = 'failing';
        badgeData.colorscheme = 'red';
      } else {
        badgeData.text[1] = 'unknown';
        badgeData.colorscheme = 'lightgray';
      }

      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Docker Hub automated integration.
camp.route(/^\/docker\/automated\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, jrottenberg
  var repo = match[2];  // eg, ffmpeg
  var format = match[3];
  if (user === '_') {
    user = 'library';
  }
  var path = user + '/' + repo;
  var url = 'https://registry.hub.docker.com/v2/repositories/' + path;
  var badgeData = getBadgeData('docker build', data);
  request(url, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res, { 404: 'repo not found' })) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var parsedData = JSON.parse(buffer);
      var is_automated = parsedData.is_automated;
      if (is_automated) {
        badgeData.text[1] = 'automated';
        setBadgeColor(badgeData, data.colorB || '066da5');
      } else {
        badgeData.text[1] = 'manual';
        badgeData.colorscheme = 'yellow';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Docker Hub automated integration, most recent build's status (passed, pending, failed)
camp.route(/^\/docker\/build\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, jrottenberg
  var repo = match[2];  // eg, ffmpeg
  var format = match[3];
  if (user === '_') {
    user = 'library';
  }
  var path = user + '/' + repo;
  var url = 'https://registry.hub.docker.com/v2/repositories/' + path + '/buildhistory';
  var badgeData = getBadgeData('docker build', data);
  request(url, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res, { 404: 'repo not found' })) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var parsedData = JSON.parse(buffer);
      var most_recent_status = parsedData.results[0].status;
      if (most_recent_status == 10) {
        badgeData.text[1] = 'passing';
        badgeData.colorscheme = 'brightgreen';
      } else if (most_recent_status < 0) {
        badgeData.text[1] = 'failing';
        badgeData.colorscheme = 'red';
      } else {
        badgeData.text[1] = 'building';
        setBadgeColor(badgeData, data.colorB || '066da5');
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Twitter integration.
camp.route(/^\/twitter\/url\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[1]; // eg, https
  var path = match[2];   // eg, shields.io
  var format = match[3];
  var page = encodeURIComponent(scheme + '://' + path);
  // The URL API died: #568.
  //var url = 'http://cdn.api.twitter.com/1/urls/count.json?url=' + page;
  var badgeData = getBadgeData('tweet', data);
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('twitter', data);
    badgeData.links = [
      'https://twitter.com/intent/tweet?text=Wow:&url=' + page,
      'https://twitter.com/search?q=' + page,
     ];
  }
  badgeData.text[1] = '';
  badgeData.colorscheme = null;
  badgeData.colorB = data.colorB || '#55ACEE';
  sendBadge(format, badgeData);
}));

// Twitter follow badge.
camp.route(/^\/twitter\/follow\/@?([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1]; // eg, shields_io
  var format = match[2];
  var options = {
    url: 'http://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=' + user,
  };
  var badgeData = getBadgeData('Follow @' + user, data);

  badgeData.colorscheme = null;
  badgeData.colorB = '#55ACEE';
  if (badgeData.template === 'social') {
    badgeData.logo = getLogo('twitter', data);
  }
  badgeData.links = [
    'https://twitter.com/intent/follow?screen_name=' + user,
    'https://twitter.com/' + user + '/followers',
  ];
  badgeData.text[1] = '';
  request(options, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      // The data is formatted as an array.
      var data = JSON.parse(buffer)[0];
      if (data === undefined){
        badgeData.text[1] = 'invalid user';
      } else if (data.followers_count != null){// data.followers_count could be zero… don't just check if falsey.
        badgeData.text[1] = metric(data.followers_count);
      }
    } catch(e) {
      badgeData.text[1] = 'invalid';
    }
    sendBadge(format, badgeData);
  });
}));

// Snap CI build integration - no longer available.
camp.route(/^\/snap(-ci?)\/([^/]+\/[^/]+)(?:\/(.+))\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const format = match[4];
  const badgeData = getDeprecatedBadge('snap CI', data);
  sendBadge(format, badgeData);
}));

// Visual Studio Team Services build integration.
camp.route(/^\/vso\/build\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var name = match[1];    // User name
  var project = match[2]; // Project ID, e.g. 953a34b9-5966-4923-a48a-c41874cfb5f5
  var build = match[3];   // Build definition ID, e.g. 1
  var format = match[4];
  var url = 'https://' + name + '.visualstudio.com/DefaultCollection/_apis/public/build/definitions/' + project + '/' + build + '/badge';
  var badgeData = getBadgeData('build', data);
  fetchFromSvg(request, url, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      badgeData.text[1] = res.toLowerCase();
      if (res === 'succeeded') {
        badgeData.colorscheme = 'brightgreen';
        badgeData.text[1] = 'passing';
      } else if (res === 'failed') {
        badgeData.colorscheme = 'red';
        badgeData.text[1] = 'failing';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// ImageLayers.io integration.
camp.route(/^\/imagelayers\/(image-size|layers)\/([^/]+)\/([^/]+)\/([^/]*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];
  var user = match[2];
  var repo = match[3];
  var tag = match[4];
  var format = match[5];
  if (user === '_') {
    user = 'library';
  }
  var path = user + '/' + repo;
  var badgeData = getBadgeData(type, data);
  var options = {
    method: 'POST',
    json: true,
    body: {
      "repos": [{ "name": path, "tag": tag }],
    },
    uri: 'https://imagelayers.io/registry/analyze',
  };
  request(options, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (type == 'image-size') {
        var size = metric(buffer[0].repo.size) + "B";
        badgeData.text[0] = getLabel('image size', data);
        badgeData.text[1] = size;
      } else if (type == 'layers') {
        badgeData.text[1] = buffer[0].repo.count;
      }
      badgeData.colorscheme = null;
      badgeData.colorB = '#007ec6';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// MicroBadger integration.
camp.route(/^\/microbadger\/(image-size|layers)\/([^/]+)\/([^/]+)\/?([^/]*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const type = match[1];
  let user = match[2];
  const repo = match[3];
  const tag = match[4];
  const format = match[5];
  if (user === '_') {
    user = 'library';
  }
  const url = `https://api.microbadger.com/v1/images/${user}/${repo}`;

  let badgeData = getBadgeData(type, data);
  if (type === 'image-size') {
    badgeData.text[0] = getLabel('image size', data);
  }

  const options = {
    method: 'GET',
    uri: url,
    headers: {
      'Accept': 'application/json',
    },
  };
  request(options, function(err, res, buffer) {
    if (res && res.statusCode === 404) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
      return;
    }

    if (err != null || !res || res.statusCode !== 200) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    try {
      const parsedData = JSON.parse(buffer);
      let image;

      if (tag) {
        image = parsedData.Versions && parsedData.Versions.find(v => v.Tags.some(t => t.tag === tag));
        if (!image) {
          badgeData.text[1] = 'not found';
          sendBadge(format, badgeData);
          return;
        }
      } else {
        image = parsedData;
      }

      if (type === 'image-size') {
        const downloadSize = image.DownloadSize;
        if (downloadSize === undefined) {
          badgeData.text[1] = 'unknown';
          sendBadge(format, badgeData);
          return;
        }
        badgeData.text[1] = prettyBytes(parseInt(downloadSize));
      } else if (type === 'layers') {
        badgeData.text[1] = image.LayerCount;
      }
      badgeData.colorscheme = null;
      badgeData.colorB = '#007ec6';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.colorscheme = 'red';
      badgeData.text[1] = 'error';
      sendBadge(format, badgeData);
    }
  });
}));

// Gitter room integration.
camp.route(/^\/gitter\/room\/([^/]+\/[^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  // match[1] is the repo, which is not used.
  var format = match[2];

  var badgeData = getBadgeData('chat', data);
  badgeData.text[1] = 'on gitter';
  badgeData.colorscheme = 'brightgreen';
  sendBadge(format, badgeData);
}));

// homebrew integration
camp.route(/^\/homebrew\/v\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var pkg = match[1];  // eg. cake
  var format = match[2];
  var apiUrl = 'https://formulae.brew.sh/api/formula/' + pkg + '.json';

  var badgeData = getBadgeData('homebrew', data);
  request(apiUrl, { headers: { 'Accept': 'application/json' } }, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var version = data.versions.stable;

      badgeData.text[1] = versionText(version);
      badgeData.colorscheme = versionColor(version);

      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// StackExchange integration.
camp.route(/^\/stackexchange\/([^/]+)\/([^/])\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var site = match[1]; // eg, stackoverflow
  var info = match[2]; // either `r`
  var item = match[3]; // eg, 232250
  var format = match[4];
  var path;
  if (info === 'r') {
    path = 'users/' + item;
  } else if (info === 't') {
    path = 'tags/' + item + '/info';
  }
  var options = {
    method: 'GET',
    uri: 'https://api.stackexchange.com/2.2/' + path + '?site=' + site,
    gzip: true,
  };
  var badgeData = getBadgeData(site, data);
  request(options, function (err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var parsedData = JSON.parse(buffer.toString());

      // IP rate limiting
      if (parsedData.error_name === 'throttle_violation') {
        return;  // Hope for the best in the cache.
      }

      if (info === 'r') {
        var reputation = parsedData.items[0].reputation;
        badgeData.text[0] = getLabel(site + ' reputation', data);
        badgeData.text[1] = metric(reputation);
        badgeData.colorscheme = floorCountColor(1000, 10000, 20000);
      } else if (info === 't') {
        var count = parsedData.items[0].count;
        badgeData.text[0] = getLabel(`${site} ${item} questions`, data);
        badgeData.text[1] = metric(count);
        badgeData.colorscheme = floorCountColor(1000, 10000, 20000);
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });}
));

// beerpay.io integration.
// e.g. JSON response: https://beerpay.io/api/v1/beerpay/projects/beerpay.io
// e.g. SVG badge: https://beerpay.io/beerpay/beerpay.io/badge.svg?style=flat-square
camp.route(/^\/beerpay\/(.*)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];     // eg, beerpay
  var project = match[2];  // eg, beerpay.io
  var format = match[3];

  var apiUrl = 'https://beerpay.io/api/v1/' + user + '/projects/' + project;
  var badgeData = getBadgeData('beerpay', data);

  request(apiUrl, function (err, res, buffer) {
    if (err) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    try {
      var data = JSON.parse(buffer);
      badgeData.text[1] = '$' + (data.total_amount || 0);
      badgeData.colorscheme = 'red';
      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Maintenance integration.
camp.route(/^\/maintenance\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var status = match[1];  // eg, yes
  var year = +match[2];  // eg, 2016
  var format = match[3];
  var badgeData = getBadgeData('maintained', data);
  try {
    var now = new Date();
    var cy = now.getUTCFullYear();  // current year.
    var m = now.getUTCMonth();  // month.
    if (status == 'no'){
      badgeData.text[1] = 'no! (as of ' + year + ')';
      badgeData.colorscheme = 'red';
    } else if (cy <= year) {
      badgeData.text[1] = status;
      badgeData.colorscheme = 'brightgreen';
    } else if ((cy === year + 1) && (m < 3)) {
      badgeData.text[1] = 'stale (as of ' + cy + ')';
    } else {
      badgeData.text[1] = 'no! (as of ' + year + ')';
      badgeData.colorscheme = 'red';
    }
    sendBadge(format, badgeData);
  } catch(e) {
    log.error(e.stack);
    badgeData.text[1] = 'invalid';
    sendBadge(format, badgeData);
  }
}));

// bitHound integration - deprecated as of July 2018
camp.route(/^\/bithound\/(code\/|dependencies\/|devDependencies\/)?(.+?)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const format = match[3];
  const badgeData = getDeprecatedBadge('bithound', data);
  sendBadge(format, badgeData);
}));

// Waffle.io integration
camp.route(/^\/waffle\/label\/([^/]+)\/([^/]+)\/?([^/]+)?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const user = match[1];  // eg, evancohen
  const repo = match[2];  // eg, smart-mirror
  const ghLabel = match[3] || 'ready';  // eg, in%20progress
  const format = match[4];
  const apiUrl = `https://api.waffle.io/${user}/${repo}/columns?with=count`;
  const badgeData = getBadgeData('waffle', data);

  request(apiUrl, function(err, res, buffer) {
    try {
      if (checkErrorResponse(badgeData, err, res)) {
        sendBadge(format, badgeData);
        return;
      }
      const cols = JSON.parse(buffer);
      if (cols.length === 0) {
        badgeData.text[1] = 'absent';
        sendBadge(format, badgeData);
        return;
      }
      let count = 0;
      let color = '78bdf2';
      for (let i = 0; i < cols.length; i++) {
        if (('label' in cols[i]) && (cols[i].label !== null)) {
          if (cols[i].label.name === ghLabel) {
            count = cols[i].count;
            color = cols[i].label.color;
            break;
          }
        }
      }
      badgeData.text[0] = getLabel(ghLabel, data);
      badgeData.text[1] = '' + count;
      badgeData.colorscheme = null;
      badgeData.colorB = makeColorB(color, data);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Arch user repository (AUR) integration.
camp.route(/^\/aur\/(version|votes|license)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];
  var pkg = match[2];
  var format = match[3];
  var apiUrl = 'https://aur.archlinux.org/rpc.php?type=info&arg=' + pkg;
  var badgeData = getBadgeData('AUR', data);
  request(apiUrl, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const parsedBuffer = JSON.parse(buffer);
      const parsedData = parsedBuffer.results;
      if (parsedBuffer.resultcount === 0) {
        /* Note the 'not found' response from Arch Linux is:
           status code = 200,
           body = {"version":1,"type":"info","resultcount":0,"results":[]}
        */
        badgeData.text[1] = 'not found';
        sendBadge(format, badgeData);
        return;
      }

      if (info === 'version') {
        badgeData.text[1] = versionText(parsedData.Version);
        if (parsedData.OutOfDate === null) {
          badgeData.colorscheme = 'blue';
        } else {
          badgeData.colorscheme = 'orange';
        }
      } else if (info === 'votes') {
        var votes = parsedData.NumVotes;
        badgeData.text[0] = getLabel('votes', data);
        badgeData.text[1] = votes;
        badgeData.colorscheme = floorCountColor(votes, 2, 20, 60);
      } else if (info === 'license') {
        var license = parsedData.License;
        badgeData.text[0] = getLabel('license', data);
        badgeData.text[1] = license;
        badgeData.colorscheme = 'blue';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Chrome web store integration
camp.route(/^\/chrome-web-store\/(v|d|users|price|rating|stars|rating-count)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];
  var storeId = match[2];  // eg, nimelepbpejjlbmoobocpfnjhihnpked
  var format = match[3];
  var badgeData = getBadgeData('chrome web store', data);
  var url = 'https://chrome.google.com/webstore/detail/' + storeId + '?hl=en&gl=US';
  var chromeWebStore = require('chrome-web-store-item-property');
  request(url, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    chromeWebStore.convert(buffer)
      .then(function (value) {
        var rating;
        switch (type) {
          case 'v':
            badgeData.text[1] = versionText(value.version);
            badgeData.colorscheme = versionColor(value.version);
            break;
          case 'd':
          case 'users':
            var downloads = value.interactionCount.UserDownloads;
            badgeData.text[0] = getLabel('users', data);
            badgeData.text[1] = metric(downloads);
            badgeData.colorscheme = downloadCountColor(downloads);
            break;
          case 'price':
            badgeData.text[0] = getLabel('price', data);
            badgeData.text[1] = currencyFromCode(value.priceCurrency) + value.price;
            badgeData.colorscheme = 'brightgreen';
            break;
          case 'rating':
            rating = Math.round(value.ratingValue * 100) / 100;
            badgeData.text[0] = getLabel('rating', data);
            badgeData.text[1] = rating + '/5';
            badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);
            break;
          case 'stars':
            rating = parseFloat(value.ratingValue);
            badgeData.text[0] = getLabel('rating', data);
            badgeData.text[1] = starRating(rating);
            badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);
            break;
          case 'rating-count':
            var ratingCount = value.ratingCount;
            badgeData.text[0] = getLabel('rating count', data);
            badgeData.text[1] = metric(ratingCount) + ' total';
            badgeData.colorscheme = floorCountColor(ratingCount, 5, 50, 500);
            break;
        }
        sendBadge(format, badgeData);
      }).catch(function (err) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      });
  });
}));

// Cauditor integration - Badge deprectiated as of March 2018
camp.route(/^\/cauditor\/(mi|ccn|npath|hi|i|ca|ce|dit)\/([^/]+)\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const format = match[5];
  const badgeData = getDeprecatedBadge('cauditor', data);
  sendBadge(format, badgeData);
}));

// Mozilla addons integration
camp.route(/^\/amo\/(v|d|rating|stars|users)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(query_data, match, sendBadge, request) {
  var type = match[1];
  var addonId = match[2];
  var format = match[3];
  var badgeData = getBadgeData('mozilla add-on', query_data);
  var url = 'https://services.addons.mozilla.org/api/1.5/addon/' + addonId;

  request(url, function(err, res, buffer) {
    if (err) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    xml2js.parseString(buffer.toString(), function (err, data) {
      if (err) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
        return;
      }

      try {
        var rating;
        switch (type) {
        case 'v':
          var version = data.addon.version[0];
          badgeData.text[1] = versionText(version);
          badgeData.colorscheme = versionColor(version);
          break;
        case 'd':
          var downloads = parseInt(data.addon.total_downloads[0], 10);
          badgeData.text[0] = getLabel('downloads', query_data);
          badgeData.text[1] = metric(downloads);
          badgeData.colorscheme = downloadCountColor(downloads);
          break;
        case 'rating':
          rating = parseInt(data.addon.rating, 10);
          badgeData.text[0] = getLabel('rating', query_data);
          badgeData.text[1] = rating + '/5';
          badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);
          break;
        case 'stars':
          rating = parseInt(data.addon.rating, 10);
          badgeData.text[0] = getLabel('stars', query_data);
          badgeData.text[1] = starRating(rating);
          badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);
          break;
        case 'users':
          var dailyUsers = parseInt(data.addon.daily_users[0], 10);
          badgeData.text[0] = getLabel('users', query_data);
          badgeData.text[1] = metric(dailyUsers);
          badgeData.colorscheme = 'brightgreen';
          break;
        }

        sendBadge(format, badgeData);
      } catch (err) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  });
}));

// jitPack version integration.
camp.route(/^\/jitpack\/v\/([^/]*)\/([^/]*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var groupId = 'com.github.' + match[1];   // github user
  var artifactId = match[2];    // the project's name
  var format = match[3];  // "svg"
  var name = 'JitPack';

  var pkg = groupId + '/' + artifactId + '/latest';
  var apiUrl = 'https://jitpack.io/api/builds/' + pkg ;

  var badgeData = getBadgeData(name, data);

  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    if (res.statusCode === 404) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var status = data['status'];
      var color = versionColor(data['version']);
      var version = versionText(data['version']);
      if(status !== 'ok'){
        color = 'red';
        version = 'unknown';
      }
      badgeData.text[1] = version;
      badgeData.colorscheme = color;
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Test if a webpage is online
camp.route(/^\/website(-(([^-/]|--|\/\/)+)-(([^-/]|--|\/\/)+)(-(([^-/]|--|\/\/)+)-(([^-/]|--|\/\/)+))?)?\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var onlineMessage = escapeFormatSlashes(match[2] != null ? match[2] : "online");
  var offlineMessage = escapeFormatSlashes(match[4] != null ? match[4] : "offline");
  var onlineColor = escapeFormatSlashes(match[7] != null ? match[7] : "brightgreen");
  var offlineColor = escapeFormatSlashes(match[9] != null ? match[9] : "red");
  var userProtocol = match[11];
  var userURI = match[12];
  var format = match[13];
  var withProtocolURI = userProtocol + "://" + userURI;
  var options = {
    method: 'HEAD',
    uri: withProtocolURI,
  };
  var badgeData = getBadgeData("website", data);
  badgeData.colorscheme = undefined;
  request(options, function(err, res) {
    // We consider all HTTP status codes below 310 as success.
    if (err != null || res.statusCode >= 310) {
      badgeData.text[1] = offlineMessage;
      setBadgeColor(badgeData, offlineColor);
      sendBadge(format, badgeData);
      return;
    } else {
      badgeData.text[1] = onlineMessage;
      setBadgeColor(badgeData, onlineColor);
      sendBadge(format, badgeData);
      return;
    }
  });
}));

// Issue Stats integration.
camp.route(/^\/issuestats\/([^/]+)(\/long)?\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];      // e.g. `i` for Issue or `p` for PR
  var longForm = !!match[2];
  var host = match[3];      // e.g. `github`
  var userRepo = match[4];  // e.g. `ruby/rails`
  var format = match[5];

  var badgeData = getBadgeData('Issue Stats', data);

  // Maps type name from URL to JSON property name prefix for badge data
  var typeToPropPrefix = {
    i: 'issue',
    p: 'pr',
  };
  var typePropPrefix = typeToPropPrefix[type];
  if (typePropPrefix === undefined) {
    badgeData.text[1] = 'invalid';
    sendBadge(format, badgeData);
    return;
  }

  var url = 'http://issuestats.com/' + host + '/' + userRepo;
  var qs = { format: 'json' };
  if (!longForm) {
    qs.concise = true;
  }
  var options = {
    method: 'GET',
    url: url,
    qs: qs,
    gzip: true,
    json: true,
  };
  request(options, function(err, res, json) {
    if (err != null || res.statusCode >= 500) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }

    if (res.statusCode >= 400 || !json || typeof json !== 'object') {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
      return;
    }

    try {
      var label = json[typePropPrefix + '_badge_preamble'];
      var value = json[typePropPrefix + '_badge_words'];
      var color = json[typePropPrefix + '_badge_color'];

      if (label != null) badgeData.text[0] = getLabel(label, data);
      badgeData.text[1] = value || 'invalid';
      if (color != null) badgeData.colorscheme = color;

      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Libraries.io integration.
camp.route(/^\/librariesio\/(github|release)\/([\w\-_]+\/[\w\-_]+)\/?([\w\-_.]+)?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const resource  = match[1];
  const project   = match[2];
  const version   = match[3];
  const format    = match[4];

  let uri;
  switch (resource) {
    case 'github': {
      uri = 'https://libraries.io/api/github/' + project + '/dependencies';
      break;
    }
    case 'release': {
      const v = version || 'latest';
      uri = 'https://libraries.io/api/' + project + '/' + v + '/dependencies';
      break;
    }
  }

  const options = { method: 'GET', json: true, uri: uri };
  const badgeData = getBadgeData('dependencies', data);

  request(options, function(err, res, json) {
    if (checkErrorResponse(badgeData, err, res, { 404: 'not available' })) {
      sendBadge(format, badgeData);
      return;
    }

    try {
      const deprecated = json.dependencies.filter(function(dep) {
        return dep.deprecated;
      });

      const outofdate = json.dependencies.filter(function(dep) {
        return dep.outdated;
      });

      // Deprecated dependencies are really bad
      if (deprecated.length > 0) {
        badgeData.colorscheme = 'red';
        badgeData.text[1] = deprecated.length + ' deprecated';
        return sendBadge(format, badgeData);
      }

      // Out of date dependencies are pretty bad
      if (outofdate.length > 0) {
        badgeData.colorscheme = 'orange';
        badgeData.text[1] = outofdate.length + ' out of date';
        return sendBadge(format, badgeData);
      }

      // Up to date dependencies are good!
      badgeData.colorscheme = 'brightgreen';
      badgeData.text[1] = 'up to date';
      return sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// JetBrains Plugins repository integration
camp.route(/^\/jetbrains\/plugin\/(d|v)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var pluginId = match[2];
  var type = match[1];
  var format = match[3];
  var leftText = type === 'v' ? 'jetbrains plugin' : 'downloads';
  var badgeData = getBadgeData(leftText, data);
  var url = 'https://plugins.jetbrains.com/plugins/list?pluginId=' + pluginId;

  request(url, function(err, res, buffer) {
    if (err || res.statusCode !== 200) {
      badgeData.text[1] = 'inaccessible';
      return sendBadge(format, badgeData);
    }

    xml2js.parseString(buffer.toString(), function (err, data) {
      if (err) {
        badgeData.text[1] = 'invalid';
        return sendBadge(format, badgeData);
      }

      try {
        var plugin = data["plugin-repository"].category;
        if (!plugin) {
          badgeData.text[1] = 'not found';
          return sendBadge(format, badgeData);
        }
        switch (type) {
        case 'd':
          var downloads = parseInt(data["plugin-repository"].category[0]["idea-plugin"][0]["$"].downloads, 10);
          if (isNaN(downloads)) {
            badgeData.text[1] = 'invalid';
            return sendBadge(format, badgeData);
          }
          badgeData.text[1] = metric(downloads);
          badgeData.colorscheme = downloadCountColor(downloads);
          return sendBadge(format, badgeData);
        case 'v':
          var version = data['plugin-repository'].category[0]["idea-plugin"][0].version[0];
          badgeData.text[1] = versionText(version);
          badgeData.colorscheme = versionColor(version);
          return sendBadge(format, badgeData);
        }
      } catch (err) {
        badgeData.text[1] = 'invalid';
        return sendBadge(format, badgeData);
      }
    });
  });
}));

// Swagger Validator integration.
camp.route(/^\/swagger\/(valid)\/(2\.0)\/(https?)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  // match[1] is not used                 // e.g. `valid` for validate
  // match[2] is reserved for future use  // e.g. `2.0` for OpenAPI 2.0
  var scheme = match[3];                  // e.g. `https`
  var swaggerUrl = match[4];              // e.g. `api.example.com/swagger.yaml`
  var format = match[5];

  var badgeData = getBadgeData('swagger', data);

  var urlParam = encodeURIComponent(scheme + '://' + swaggerUrl);
  var url = 'http://online.swagger.io/validator/debug?url=' + urlParam;
  var options = {
    method: 'GET',
    url: url,
    gzip: true,
    json: true,
  };
  request(options, function(err, res, json) {
    try {
      if (err != null || res.statusCode >= 500 || typeof json !== 'object') {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }

      var messages = json.schemaValidationMessages;
      if (messages == null || messages.length === 0) {
        badgeData.colorscheme = 'brightgreen';
        badgeData.text[1] = 'valid';
      } else {
        badgeData.colorscheme = 'red';

        var firstMessage = messages[0];
        if (messages.length === 1 &&
            firstMessage.level === 'error' &&
            /^Can't read from/.test(firstMessage.message)) {
          badgeData.text[1] = 'not found';
        } else {
          badgeData.text[1] = 'invalid';
        }
      }
      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
  });
}));

// Discord integration
camp.route(/^\/discord\/([^/]+)\.(svg|png|gif|jpg|json)$/,
cache((data, match, sendBadge, request) => {
  const serverID = match[1];
  const format = match[2];
  const apiUrl = `https://discordapp.com/api/guilds/${serverID}/widget.json`;

  request(apiUrl, (err, res, buffer) => {
    const badgeData = getBadgeData('chat', data);
    if (res && res.statusCode === 404) {
      badgeData.text[1] = 'invalid server';
      sendBadge(format, badgeData);
      return;
    }
    if (err != null || !res || res.statusCode !== 200) {
      badgeData.text[1] = 'inaccessible';
      if (res && res.headers['content-type'] === 'application/json') {
        try {
          const data = JSON.parse(buffer);
          if (data && typeof data.message === 'string') {
            badgeData.text[1] = data.message.toLowerCase();
          }
        } catch(e) {
        }
      }
      sendBadge(format, badgeData);
      return;
    }
    try {
      const data = JSON.parse(buffer);
      const members = Array.isArray(data.members) ? data.members : [];
      badgeData.text[1] = members.length + ' online';
      badgeData.colorscheme = 'brightgreen';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Maven metadata versioning integration.
camp.route(/^\/maven-metadata\/v\/(https?)\/(.+\.xml)\.(svg|png|gif|jpg|json)$/,
  cache(function (data, match, sendBadge, request) {
    const [, scheme, hostAndPath, format] = match;
    const metadataUri = `${scheme}://${hostAndPath}`;
    request(metadataUri, (error, response, body) => {
      const badge = getBadgeData('maven', data);
      if (!error && response.statusCode >= 200 && response.statusCode < 300) {
        try {
          xml2js.parseString(body, (err, result) => {
            if (err) {
              badge.text[1] = 'error';
              badge.colorscheme = 'red';
              sendBadge(format, badge);
            } else {
              const version = result.metadata.versioning[0].versions[0].version.slice(-1)[0];
              badge.text[1] = versionText(version);
              badge.colorscheme = versionColor(version);
              sendBadge(format, badge);
            }
          });
        } catch (e) {
          badge.text[1] = 'error';
          badge.colorscheme = 'red';
          sendBadge(format, badge);
        }
      } else {
        badge.text[1] = 'error';
        badge.colorscheme = 'red';
        sendBadge(format, badge);
      }
    });
}));

// User defined sources - JSON response
camp.route(/^\/badge\/dynamic\/(json|xml|yaml)\.(svg|png|gif|jpg|json)$/,
cache({
  queryParams: ['uri', 'url', 'query', 'prefix', 'suffix'],
  handler: function(query, match, sendBadge, request) {
    var type = match[1];
    var format = match[2];
    var prefix = query.prefix || '';
    var suffix = query.suffix || '';
    var pathExpression = query.query;
    var requestOptions = {};

    var badgeData = getBadgeData('custom badge', query);

    if (!query.uri && !query.url || !query.query){
      setBadgeColor(badgeData, 'red');
      badgeData.text[1] = !query.query ? 'no query specified' : 'no url specified';
      sendBadge(format, badgeData);
      return;
    }

    try {
      var url = encodeURI(decodeURIComponent(query.url || query.uri));
    } catch(e){
      setBadgeColor(badgeData, 'red');
      badgeData.text[1] = 'malformed url';
      sendBadge(format, badgeData);
      return;
    }

    switch (type) {
      case 'json':
        requestOptions = {
          headers: {
            Accept: 'application/json',
          },
          json: true,
        };
        break;
      case 'xml':
        requestOptions = {
          headers: {
            Accept: 'application/xml, text/xml',
          },
        };
        break;
      case 'yaml':
        requestOptions = {
          headers: {
            Accept: 'text/x-yaml,  text/yaml, application/x-yaml, application/yaml, text/plain',
          },
        };
        break;
    }

    request(url, requestOptions, (err, res, data) => {
      try {
        if (checkErrorResponse(badgeData, err, res, { 404: 'resource not found' })) {
          return;
        }

        badgeData.colorscheme = 'brightgreen';

        let innerText = [];
        switch (type){
          case 'json':
            data = (typeof data == 'object' ? data : JSON.parse(data));
            data = jp.query(data, pathExpression);
            if (!data.length) {
              throw 'no result';
            }
            innerText = data;
            break;
          case 'xml':
            data = new dom().parseFromString(data);
            data = xpath.select(pathExpression, data);
            if (!data.length) {
              throw 'no result';
            }
            data.forEach((i,v)=>{
              innerText.push(pathExpression.indexOf('@') + 1 ? i.value : i.firstChild.data);
            });
            break;
          case 'yaml':
            data = yaml.safeLoad(data);
            data = jp.query(data, pathExpression);
            if (!data.length) {
              throw 'no result';
            }
            innerText = data;
            break;
        }
        badgeData.text[1] = (prefix || '') + innerText.join(', ') + (suffix || '');
      } catch (e) {
        setBadgeColor(badgeData, 'lightgrey');
        badgeData.text[1] = e;
      } finally {
        sendBadge(format, badgeData);
      }
    });
  },
}));

// nsp for npm packages
camp.route(/^\/nsp\/npm\/(?:@([^/]+)?\/)?([^/]+)?(?:\/([^/]+)?)?\.(svg|png|gif|jpg|json)?$/, cache((data, match, sendBadge, request) => {
  // A: /nsp/npm/:package.:format
  // B: /nsp/npm/:package/:version.:format
  // C: /nsp/npm/@:scope/:package.:format
  // D: /nsp/npm/@:scope/:package/:version.:format
  const badgeData = getBadgeData('nsp', data);
  const capturedScopeWithoutAtSign = match[1];
  const capturedPackageName = match[2];
  const capturedVersion = match[3];
  const capturedFormat= match[4];

  function getNspResults (scopeWithoutAtSign = null, packageName = '', packageVersion = '') {
    const nspRequestOptions = {
      method: 'POST',
      body: {
        package: {
          name: null,
          version: packageVersion,
        },
      },
      json: true,
    };

    if (typeof scopeWithoutAtSign === 'string') {
      nspRequestOptions.body.package.name = `@${scopeWithoutAtSign}/${packageName}`;
    } else {
      nspRequestOptions.body.package.name = packageName;
    }

    request('https://api.nodesecurity.io/check', nspRequestOptions, (error, response, body) => {
      if (error !== null || typeof body !== 'object' || body === null) {
        badgeData.text[1] = 'invalid';
        badgeData.colorscheme = 'red';
      } else if (body.length !== 0) {
        badgeData.text[1] = `${body.length} vulnerabilities`;
        badgeData.colorscheme = 'red';
      } else {
        badgeData.text[1] = 'no known vulnerabilities';
        badgeData.colorscheme = 'brightgreen';
      }

      sendBadge(capturedFormat, badgeData);
    });
  }

  function getNpmVersionThenNspResults (scopeWithoutAtSign = null, packageName = '') {
    // nsp doesn't properly detect the package version in POST requests so this function gets it for us
    // https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#getpackageversion
    const npmRequestOptions = {
      headers: {
        Accept: '*/*',
      },
      json: true,
    };
    let npmURL = null;

    if (typeof scopeWithoutAtSign === 'string') {
      // Using 'latest' would save bandwidth, but it is currently not supported for scoped packages
      npmURL = `http://registry.npmjs.org/@${scopeWithoutAtSign}%2F${packageName}`;
    } else {
      npmURL = `http://registry.npmjs.org/${packageName}/latest`;
    }

    request(npmURL, npmRequestOptions, (error, response, body) => {
      if (response !== null && response.statusCode === 404) {
        // NOTE: in POST requests nsp does not distinguish between
        // 'package not found' and 'no known vulnerabilities'.
        // To keep consistency in the use case where a version is provided
        // (which skips `getNpmVersionThenNspResults()` altogether) we'll say
        // 'no known vulnerabilities' since it is technically true in both cases
        badgeData.text[1] = 'no known vulnerabilities';

        sendBadge(capturedFormat, badgeData);
      } else if (error !== null || typeof body !== 'object' || body === null) {
        badgeData.text[1] = 'invalid';
        badgeData.colorscheme = 'red';

        sendBadge(capturedFormat, badgeData);
      } else if (typeof body.version === 'string') {
        getNspResults(scopeWithoutAtSign, packageName, body.version);
      } else if (typeof body['dist-tags'] === 'object') {
        getNspResults(scopeWithoutAtSign, packageName, body['dist-tags'].latest);
      } else {
        badgeData.text[1] = 'invalid';
        badgeData.colorscheme = 'red';

        sendBadge(capturedFormat, badgeData);
      }
    });
  }

  if (typeof capturedVersion === 'string') {
    getNspResults(capturedScopeWithoutAtSign, capturedPackageName, capturedVersion);
  } else {
    getNpmVersionThenNspResults(capturedScopeWithoutAtSign, capturedPackageName);
  }
}));

// bundle size for npm packages
camp.route(/^\/bundlephobia\/(min|minzip)\/(?:@([^/]+)?\/)?([^/]+)?(?:\/([^/]+)?)?\.(svg|png|gif|jpg|json)?$/,
  cache((data, match, sendBadge, request) => {
  // A: /bundlephobia/(min|minzip)/:package.:format
  // B: /bundlephobia/(min|minzip)/:package/:version.:format
  // C: /bundlephobia/(min|minzip)/@:scope/:package.:format
  // D: /bundlephobia/(min|minzip)/@:scope/:package/:version.:format
  const resultType = match[1];
  const scope = match[2];
  const packageName = match[3];
  const packageVersion = match[4];
  const format = match[5];
  const showMin = resultType === 'min';

  const badgeData = getBadgeData(showMin ? 'minified size' : 'minzipped size', data);

  let packageString = typeof scope === 'string' ?
    `@${scope}/${packageName}` : packageName;

  if(packageVersion) {
    packageString += `@${packageVersion}`;
  }

  const requestOptions = {
    url: 'https://bundlephobia.com/api/size',
    qs: {
      package: packageString,
    },
    json: true,
  };

  /**
   * `ErrorCode` => `error code`
   * @param {string} code
   * @returns {string}
   */
  const formatErrorCode = (code) =>
    code.replace(/([A-Z])/g, ' $1').trim().toLowerCase();

  request(requestOptions, (error, response, body) => {
    if(typeof body !== 'object' || body === null) {
      badgeData.text[1] = 'error';
      badgeData.colorscheme = 'red';
    } else if (error !== null || body.error) {
      badgeData.text[1] = 'code' in body.error ?
        formatErrorCode(body.error.code) : 'error';
      badgeData.colorscheme = 'red';
    } else {
      badgeData.text[1] = prettyBytes(showMin ? body.size : body.gzip);
      badgeData.colorscheme = 'blue';
    }
    sendBadge(format, badgeData);
  });
}));

// Redmine plugin rating.
camp.route(/^\/redmine\/plugin\/(rating|stars)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];
  var plugin = match[2];
  var format = match[3];
  var options = {
    method: 'GET',
    uri: 'https://www.redmine.org/plugins/' + plugin + '.xml',
  };

  var badgeData = getBadgeData(type, data);
  request(options, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    xml2js.parseString(buffer.toString(), function (err, data) {
      try {
        var rating = data['redmine-plugin']['ratings-average'][0]._;
        badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);

        switch (type) {
          case 'rating':
            badgeData.text[1] = rating + '/5.0';
            break;
          case 'stars':
            badgeData.text[1] = starRating(Math.round(rating));
            break;
        }

        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  });
}));

// PHP version from Packagist
camp.route(/^\/packagist\/php-v\/([^/]+\/[^/]+)(?:\/([^/]+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const userRepo = match[1];  // eg, espadrine/sc
  const version = match[2] ? match[2] : 'dev-master';
  const format = match[3];
  const options = {
    method: 'GET',
    uri: 'https://packagist.org/p/' + userRepo + '.json',
  };
  const badgeData = getBadgeData('PHP', data);
  request(options, function(err, res, buffer) {
    if (err !== null) {
      log.error('Packagist error: ' + err.stack);
      if (res) {
        log.error('' + res);
      }
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }

    try {
      const data = JSON.parse(buffer);
      badgeData.text[1] = data.packages[userRepo][version].require.php;
      badgeData.colorscheme = 'blue';
    } catch(e) {
      badgeData.text[1] = 'invalid';
    }
    sendBadge(format, badgeData);
  });
}));


// PHP version from PHP-Eye
camp.route(/^\/php-eye\/([^/]+\/[^/]+)(?:\/([^/]+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const userRepo = match[1];  // eg, espadrine/sc
  const version = match[2] || 'dev-master';
  const format = match[3];
  const options = {
    method: 'GET',
    uri: 'https://php-eye.com/api/v1/package/' + userRepo + '.json',
  };
  const badgeData = getBadgeData('PHP tested', data);
  getPhpReleases(githubApiProvider, (err, phpReleases) => {
    if (err != null) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    request(options, function(err, res, buffer) {
      if (err !== null) {
        log.error('PHP-Eye error: ' + err.stack);
        if (res) {
          log.error('' + res);
        }
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
        return;
      }

      try {
        const data = JSON.parse(buffer);
        const travis = data.versions.filter((release) => release.name === version)[0].travis;

        if (!travis.config_exists) {
          badgeData.colorscheme = 'red';
          badgeData.text[1] = 'not tested';
          sendBadge(format, badgeData);
          return;
        }

        let versions = [];
        for (const index in travis.runtime_status) {
          if (travis.runtime_status[index] === 3 && index.match(/^php\d\d$/) !== null) {
            versions.push(index.replace(/^php(\d)(\d)$/, '$1.$2'));
          }
        }

        let reduction = phpVersionReduction(versions, phpReleases);

        if (travis.runtime_status.hhvm === 3) {
          reduction += reduction ? ', ' : '';
          reduction += 'HHVM';
        }

        if (reduction) {
          badgeData.colorscheme = 'brightgreen';
          badgeData.text[1] = reduction;
        } else if (!versions.length) {
          badgeData.colorscheme = 'red';
          badgeData.text[1] = 'not tested';
        } else {
          badgeData.text[1] = 'invalid';
        }
      } catch(e) {
        badgeData.text[1] = 'invalid';
      }
      sendBadge(format, badgeData);
    });
  });
}));

// Vaadin Directory Integration
camp.route(/^\/vaadin-directory\/(star|stars|status|rating|rc|rating-count|v|version|rd|release-date)\/(.*).(svg|png|gif|jpg|json)$/, cache(function (data, match, sendBadge, request) {
  var type = match[1]; // Field required
  var urlIdentifier = match[2]; // Name of repository
  var format = match[3]; // Format
  // API URL which contains also authentication info
  var apiUrl = 'https://vaadin.com/vaadincom/directory-service/components/search/findByUrlIdentifier?projection=summary&urlIdentifier=' + urlIdentifier;

  // Set left-side text to 'Vaadin-Directory' by default
  var badgeData = getBadgeData("Vaadin Directory", data);
  request(apiUrl, function(err, res, buffer) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }

    try {
      var data = JSON.parse(buffer);
      // Round the rating to 1 points decimal
      var rating = ( Math.round(data.averageRating * 10) / 10 ).toFixed(1);
      var ratingCount = data.ratingCount;
      var lv = data.latestAvailableRelease.name.toLowerCase();
      var ld = data.latestAvailableRelease.publicationDate;
      switch (type) {
        // Since the first deploy was with `star`, I put the case there
        // for safety pre-caution
        case 'star':
        case 'stars': // Stars
          badgeData.text[0] = getLabel('stars', data);
          badgeData.text[1] = starRating(rating);
          badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);
          break;
        case 'status': // Status of the component
          var isPublished = data.status.toLowerCase();
          if (isPublished === 'published') {
            badgeData.text[1] = "published";
            badgeData.colorB = '#00b4f0';
          } else {
            badgeData.text[1] = "unpublished";
          }
          break;
        case 'rating': // rating
        badgeData.text[0] = getLabel('rating', data);
          if (!isNaN(rating)) {
            badgeData.text[1] = rating + '/5';
            badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);
          }
          break;
        case 'rc': // rating count
        case 'rating-count':
          badgeData.text[0] = getLabel('rating count', data);
          if (ratingCount && ratingCount != 0) {
            badgeData.text[1] = metric(data.ratingCount) + ' total';
            badgeData.colorscheme = floorCountColor(data.ratingCount, 5, 50, 500);
          }
          break;
        case 'v': // latest version
        case 'version':
          badgeData.text[0] = getLabel('latest ver', data);
          badgeData.text[1] = lv;
          badgeData.colorB = '#00b4f0';
          break;
        case 'rd':
        case 'release-date': // The release date of the latest version
          badgeData.text[0] = getLabel('latest release date', data);
          badgeData.text[1] = formatDate(ld);
          badgeData.colorscheme = ageColor(ld);
          break;
      }
      sendBadge(format, badgeData);
    } catch (e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
    }
  });

}));

// Bugzilla bug integration
camp.route(/^\/bugzilla\/(\d+)\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var bugNumber = match[1];  // eg, 1436739
  var format = match[2];
  var options = {
    method: 'GET',
    json: true,
    uri: 'https://bugzilla.mozilla.org/rest/bug/' + bugNumber,
  };
  var badgeData = getBadgeData('bug ' + bugNumber, data);
  request(options, function (err, res, json) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      var bug = json.bugs[0];

      switch (bug.status) {
        case 'UNCONFIRMED':
          badgeData.text[1] = 'unconfirmed';
          badgeData.colorscheme = 'blue';
          break;
        case 'NEW':
          badgeData.text[1] = 'new';
          badgeData.colorscheme = 'blue';
          break;
        case 'ASSIGNED':
          badgeData.text[1] = 'assigned';
          badgeData.colorscheme = 'green';
          break;
        case 'RESOLVED':
          if (bug.resolution === 'FIXED') {
            badgeData.text[1] = 'fixed';
            badgeData.colorscheme = 'brightgreen';
          } else if (bug.resolution === 'INVALID') {
            badgeData.text[1] = 'invalid';
            badgeData.colorscheme = 'yellow';
          } else if (bug.resolution === 'WONTFIX') {
            badgeData.text[1] = 'won\'t fix';
            badgeData.colorscheme = 'orange';
          } else if (bug.resolution === 'DUPLICATE') {
            badgeData.text[1] = 'duplicate';
            badgeData.colorscheme = 'lightgrey';
          } else if (bug.resolution === 'WORKSFORME') {
            badgeData.text[1] = 'works for me';
            badgeData.colorscheme = 'yellowgreen';
          } else if (bug.resolution === 'INCOMPLETE') {
            badgeData.text[1] = 'incomplete';
            badgeData.colorscheme = 'red';
          } else {
            badgeData.text[1] = 'unknown';
          }
          break;
        default:
          badgeData.text[1] = 'unknown';
      }
      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'unknown';
      sendBadge(format, badgeData);
    }
  });
}));

// Dependabot SemVer compatibility integration
camp.route(/^\/dependabot\/semver\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const packageManager = match[1];
  const dependencyName = match[2];
  const format = match[3];
  const options = {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    uri: `https://api.dependabot.com/badges/compatibility_score?package-manager=${packageManager}&dependency-name=${dependencyName}&version-scheme=semver`,
  };
  const badgeData = getBadgeData('semver stability', data);
  badgeData.links = [`https://dependabot.com/compatibility-score.html?package-manager=${packageManager}&dependency-name=${dependencyName}&version-scheme=semver`];
  badgeData.logo = getLogo('dependabot', data);
  request(options, function(err, res) {
    if (checkErrorResponse(badgeData, err, res)) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      const dependabotData = JSON.parse(res['body']);
      badgeData.text[1] = dependabotData.status;
      badgeData.colorscheme = dependabotData.colour;
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      badgeData.colorscheme = 'red';
      sendBadge(format, badgeData);
    }
  });
}));

// Any badge.
camp.route(/^\/(:|badge\/)(([^-]|--)*?)-?(([^-]|--)*)-(([^-]|--)+)\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var subject = escapeFormat(match[2]);
  var status = escapeFormat(match[4]);
  var color = escapeFormat(match[6]);
  var format = match[8];

  analytics.noteRequest(data, match);

  // Cache management - the badge is constant.
  var cacheDuration = (3600*24*1)|0;    // 1 day.
  ask.res.setHeader('Cache-Control', 'max-age=' + cacheDuration);
  if (+(new Date(ask.req.headers['if-modified-since'])) >= +serverStartTime) {
    ask.res.statusCode = 304;
    ask.res.end();  // not modified.
    return;
  }
  ask.res.setHeader('Last-Modified', serverStartTime.toGMTString());

  // Badge creation.
  try {
    var badgeData = getBadgeData(subject, data);
    badgeData.text[0] = getLabel(subject, data);
    badgeData.text[1] = status;
    badgeData.colorB = makeColorB(color, data);
    badgeData.template = data.style;
    if (config.profiling.makeBadge) {
      console.time('makeBadge total');
    }
    const svg = makeBadge(badgeData);
    if (config.profiling.makeBadge) {
      console.timeEnd('makeBadge total');
    }
    makeSend(format, ask.res, end)(svg);
  } catch(e) {
    log.error(e.stack);
    const svg = makeBadge({ text: ['error', 'bad badge'], colorscheme: 'red' });
    makeSend(format, ask.res, end)(svg);
  }
});

// Production cache debugging.
let bitFlip = false;
camp.route(/^\/flip\.svg$/, function(data, match, end, ask) {
  var cacheSecs = 60;
  ask.res.setHeader('Cache-Control', 'max-age=' + cacheSecs);
  var reqTime = new Date();
  var date = (new Date(+reqTime + cacheSecs * 1000)).toGMTString();
  ask.res.setHeader('Expires', date);
  var badgeData = getBadgeData('flip', data);
  bitFlip = !bitFlip;
  badgeData.text[1] = bitFlip? 'on': 'off';
  badgeData.colorscheme = bitFlip? 'brightgreen': 'red';
  const svg = makeBadge(badgeData);
  makeSend('svg', ask.res, end)(svg);
});

// Any badge, old version.
camp.route(/^\/([^/]+)\/(.+).png$/,
function(data, match, end, ask) {
  var subject = match[1];
  var status = match[2];
  var color = data.color;

  // Cache management - the badge is constant.
  var cacheDuration = (3600*24*1)|0;    // 1 day.
  ask.res.setHeader('Cache-Control', 'max-age=' + cacheDuration);
  if (+(new Date(ask.req.headers['if-modified-since'])) >= +serverStartTime) {
    ask.res.statusCode = 304;
    ask.res.end();  // not modified.
    return;
  }
  ask.res.setHeader('Last-Modified', serverStartTime.toGMTString());

  // Badge creation.
  try {
    var badgeData = { text: [subject, status] };
    badgeData.colorscheme = color;
    const svg = makeBadge(badgeData);
    makeSend('png', ask.res, end)(svg);
  } catch(e) {
    const svg = makeBadge({ text: ['error', 'bad badge'], colorscheme: 'red' });
    makeSend('png', ask.res, end)(svg);
  }
});

if (config.redirectUri) {
  camp.route(/^\/$/, (data, match, end, ask) => {
    ask.res.statusCode = 302;
    ask.res.setHeader('Location', config.redirectUri);
    ask.res.end();
  });
}
