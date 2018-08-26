'use strict';

const dom = require('xmldom').DOMParser;
const jp = require('jsonpath');
const path = require('path');
const prettyBytes = require('pretty-bytes');
const queryString = require('query-string');
const xml2js = require('xml2js');
const xpath = require('xpath');
const yaml = require('js-yaml');
const Raven = require('raven');

const serverSecrets = require('./lib/server-secrets');
Raven.config(process.env.SENTRY_DSN || serverSecrets.sentry_dsn).install();
Raven.disableConsoleAlerts();

const { loadServiceClasses } = require('./services');
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
const { clearRegularUpdateCache } = require('./lib/regular-update');
const { makeSend } = require('./lib/result-sender');
const { escapeFormat } = require('./lib/path-helpers');
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
