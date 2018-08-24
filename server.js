'use strict';

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
const { getDeprecatedBadge } = require('./lib/deprecation-helpers');
const { checkErrorResponse } = require('./lib/error-helper');
const analytics = require('./lib/analytics');
const config = require('./lib/server-config');
const GithubConstellation = require('./services/github/github-constellation');
const sysMonitor = require('./lib/sys/monitor');
const log = require('./lib/log');
const { makeMakeBadgeFn } = require('./lib/make-badge');
const { QuickTextMeasurer } = require('./lib/text-measurer');
const suggest = require('./lib/suggest');
const {
  versionReduction: phpVersionReduction,
  getPhpReleases,
} = require('./lib/php-version');
const {
  currencyFromCode,
  metric,
  starRating,
  addv: versionText,
  formatDate,
} = require('./lib/text-formatters');
const {
  downloadCount: downloadCountColor,
  floorCount: floorCountColor,
  version: versionColor,
  age: ageColor,
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
  getVscodeApiReqOptions,
  getVscodeStatistic,
} = require('./lib/vscode-badge-helpers');
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
    { camp, handleRequest: cache, githubApiProvider },
    { handleInternalErrors: config.handleInternalErrors }));

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
