var secureServer = !!process.env.HTTPS;
var secureServerKey = process.env.HTTPS_KEY;
var secureServerCert = process.env.HTTPS_CRT;
var serverPort = +process.env.PORT || +process.argv[2] || (secureServer? 443: 80);
var bindAddress = process.env.BIND_ADDRESS || process.argv[3] || '::';
var infoSite = process.env.INFOSITE || "https://shields.io";
var githubApiUrl = process.env.GITHUB_URL || 'https://api.github.com';
var path = require('path');
var Camp = require('camp');
var camp = Camp.start({
  documentRoot: path.join(__dirname, 'public'),
  port: serverPort,
  hostname: bindAddress,
  secure: secureServer,
  cert: secureServerCert,
  key: secureServerKey
});
Camp.log.unpipe('warn', 'stderr');
var tryUrl = require('url').format({
  protocol: secureServer ? 'https' : 'http',
  hostname: bindAddress,
  port: serverPort,
  pathname: 'try.html',
});
console.log(tryUrl);
var domain = require('domain');
var request = require('request');
var LruCache = require('./lib/lru-cache.js');
var badge = require('./lib/badge.js');
var svg2img = require('./lib/svg-to-img.js');
var loadLogos = require('./lib/load-logos.js');
var githubAuth = require('./lib/github-auth.js');
var querystring = require('querystring');
var prettyBytes = require('pretty-bytes');
var xml2js = require('xml2js');
var serverSecrets = require('./lib/server-secrets');
if (serverSecrets && serverSecrets.gh_client_id) {
  githubAuth.setRoutes(camp);
}

const {latest: latestVersion} = require('./lib/version.js');
const {
  compare: phpVersionCompare,
  latest: phpLatestVersion,
  isStable: phpStableVersion,
} = require('./lib/php-version.js');
const {
  currencyFromCode,
  metric,
  ordinalNumber,
  starRating,
} = require('./lib/text-formatters.js');
const {
  coveragePercentage: coveragePercentageColor,
  downloadCount: downloadCountColor,
  floorCount: floorCountColor,
  version: versionColor,
} = require('./lib/color-formatters.js');
const {
  analyticsAutoLoad,
  incrMonthlyAnalytics,
  getAnalytics
} = require('./lib/analytics');

var semver = require('semver');
var serverStartTime = new Date((new Date()).toGMTString());

var validTemplates = ['default', 'plastic', 'flat', 'flat-square', 'social'];
var darkBackgroundTemplates = ['default', 'flat', 'flat-square'];
var logos = loadLogos();

analyticsAutoLoad();
camp.ajax.on('analytics/v1', function(json, end) { end(getAnalytics()); });

var suggest = require('./lib/suggest.js');
camp.ajax.on('suggest/v1', suggest);

// Cache

// We avoid calling the vendor's server for computation of the information in a
// number of badges.
var minAccuracy = 0.75;

// The quotient of (vendor) data change frequency by badge request frequency
// must be lower than this to trigger sending the cached data *before*
// updating our data from the vendor's server.
// Indeed, the accuracy of our badges are:
// A(Δt) = 1 - min(# data change over Δt, # requests over Δt)
//             / (# requests over Δt)
//       = 1 - max(1, df) / rf
var freqRatioMax = 1 - minAccuracy;

// Request cache size of 5MB (~5000 bytes/image).
var requestCache = new LruCache(1000);

// Deep error handling for vendor hooks.
var vendorDomain = domain.create();
vendorDomain.on('error', function(err) {
  console.error('Vendor hook error:', err.stack);
});


function cache(f) {
  return function getRequest(data, match, end, ask) {
    if (data.maxAge !== undefined && /^[0-9]+$/.test(data.maxAge)) {
      ask.res.setHeader('Cache-Control', 'max-age=' + data.maxAge);
    } else {
      // Cache management - no cache, so it won't be cached by GitHub's CDN.
      ask.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    var reqTime = new Date();
    var date = (reqTime).toGMTString();
    ask.res.setHeader('Expires', date);  // Proxies, GitHub, see #221.
    ask.res.setHeader('Date', date);
    incrMonthlyAnalytics(getAnalytics().vendorMonthly);
    if (data.style === 'flat') {
      incrMonthlyAnalytics(getAnalytics().vendorFlatMonthly);
    } else if (data.style === 'flat-square') {
      incrMonthlyAnalytics(getAnalytics().vendorFlatSquareMonthly);
    }

    var cacheIndex = match[0] + '?label=' + data.label + '&style=' + data.style
      + '&logo=' + data.logo + '&logoWidth=' + data.logoWidth
      + '&link=' + JSON.stringify(data.link) + '&colorA=' + data.colorA
      + '&colorB=' + data.colorB;
    // Should we return the data right away?
    var cached = requestCache.get(cacheIndex);
    var cachedVersionSent = false;
    if (cached !== undefined) {
      // A request was made not long ago.
      var tooSoon = (+reqTime - cached.time) < cached.interval;
      if (tooSoon || (cached.dataChange / cached.reqs <= freqRatioMax)) {
        badge(cached.data.badgeData, makeSend(cached.data.format, ask.res, end));
        cachedVersionSent = true;
        // We do not wish to call the vendor servers.
        if (tooSoon) { return; }
      }
    }

    // In case our vendor servers are unresponsive.
    var serverUnresponsive = false;
    var serverResponsive = setTimeout(function() {
      serverUnresponsive = true;
      if (cachedVersionSent) { return; }
      if (requestCache.has(cacheIndex)) {
        var cached = requestCache.get(cacheIndex).data;
        badge(cached.badgeData, makeSend(cached.format, ask.res, end));
        return;
      }
      ask.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      var badgeData = getBadgeData('vendor', data);
      badgeData.text[1] = 'unresponsive';
      var extension;
      try {
        extension = match[0].split('.').pop();
      } catch(e) { extension = 'svg'; }
      badge(badgeData, makeSend(extension, ask.res, end));
    }, 25000);

    // Only call vendor servers when last request is older than…
    var cacheInterval = 5000;  // milliseconds
    var cachedRequest = function (uri, options, callback) {
      if ((typeof options === 'function') && !callback) { callback = options; }
      if (options && typeof options === 'object') {
        options.uri = uri;
      } else if (typeof uri === 'string') {
        options = {uri:uri};
      } else {
        options = uri;
      }
      options.headers = options.headers || {};
      options.headers['User-Agent'] = options.headers['User-Agent'] || 'Shields.io';
      return request(options, function(err, res, json) {
        if (res != null && res.headers != null) {
          var cacheControl = res.headers['cache-control'];
          if (cacheControl != null) {
            var age = cacheControl.match(/max-age=([0-9]+)/);
            if ((age != null) && (+age[1] === +age[1])) {
              cacheInterval = +age[1] * 1000;
            }
          }
        }
        callback(err, res, json);
      });
    };

    vendorDomain.run(function() {
      f(data, match, function sendBadge(format, badgeData) {
        if (serverUnresponsive) { return; }
        clearTimeout(serverResponsive);
        // Check for a change in the data.
        var dataHasChanged = false;
        if (cached !== undefined
          && cached.data.badgeData.text[1] !== badgeData.text[1]) {
          dataHasChanged = true;
        }
        // Add format to badge data.
        badgeData.format = format;
        // Update information in the cache.
        var updatedCache = {
          reqs: cached? (cached.reqs + 1): 1,
          dataChange: cached? (cached.dataChange + (dataHasChanged? 1: 0))
                            : 1,
          time: +reqTime,
          interval: cacheInterval,
          data: { format: format, badgeData: badgeData }
        };
        requestCache.set(cacheIndex, updatedCache);
        if (!cachedVersionSent) {
          badge(badgeData, makeSend(format, ask.res, end));
        }
      }, cachedRequest);
    });
  };
}

module.exports = {
  camp,
  requestCache
};

camp.notfound(/\.(svg|png|gif|jpg|json)/, function(query, match, end, request) {
    var format = match[1];
    var badgeData = getBadgeData("404", query);
    badgeData.text[1] = 'badge not found';
    badgeData.colorscheme = 'red';
    // Add format to badge data.
    badgeData.format = format;
    badge(badgeData, makeSend(format, request.res, end));
});

camp.notfound(/.*/, function(query, match, end, request) {
  end(null, {template: '404.html'});
});



// Vendors.

// JIRA issue integration
camp.route(/^\/jira\/issue\/(http(?:s)?)\/(.+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var protocol = match[1];  // eg, https
  var host = match[2];      // eg, issues.apache.org/jira
  var issueKey = match[3];  // eg, KAFKA-2896
  var format = match[4];

  var options = {
    method: 'GET',
    json: true,
    uri: protocol + '://' + host + '/rest/api/2/issue/' +
      encodeURIComponent(issueKey)
  };
  if (serverSecrets && serverSecrets.jira_username) {
    options.auth = {
      user: serverSecrets.jira_username,
      pass: serverSecrets.jira_password
    };
  }

  // map JIRA color names to closest shields color schemes
  var colorMap = {
    'medium-gray': 'lightgrey',
    'green': 'green',
    'yellow': 'yellow',
    'brown': 'orange',
    'warm-red': 'red',
    'blue-gray': 'blue'
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
camp.route(/^\/jira\/sprint\/(http(?:s)?)\/(.+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var protocol  = match[1]; // eg, https
  var host      = match[2]; // eg, jira.spring.io
  var sprintId  = match[3]; // eg, 94
  var format    = match[4]; // eg, png

  var options = {
    method: 'GET',
    json: true,
    uri: protocol + '://' + host + '/rest/api/2/search?jql=sprint='+sprintId+'%20AND%20type%20IN%20(Bug,Improvement,Story,"Technical%20task")&fields=resolution&maxResults=500'
  };
  if (serverSecrets && serverSecrets.jira_username) {
    options.auth = {
      user: serverSecrets.jira_username,
      pass: serverSecrets.jira_password
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

// Travis integration
camp.route(/^\/travis(-ci)?\/([^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[2];  // eg, espadrine/sc
  var branch = match[3];
  var format = match[4];
  var options = {
    method: 'HEAD',
    uri: 'https://api.travis-ci.org/' + userRepo + '.svg',
  };
  if (branch != null) {
    options.uri += '?branch=' + branch;
  }
  var badgeData = getBadgeData('build', data);
  request(options, function(err, res) {
    if (err != null) {
      console.error('Travis error: ' + err.stack);
      if (res) { console.error(''+res); }
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var state = res.headers['content-disposition']
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

// NetflixOSS metadata integration
camp.route(/^\/osslifecycle?\/([^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
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
      uri: url
    };
    var badgeData = getBadgeData('OSS Lifecycle', data);
    request(options, function(err, res, body) {
      if (err != null) {
        console.error('NetflixOSS error: ' + err.stack);
        if (res) { console.error(''+res); }
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
        return;
      }
      try {
        var matchStatus = body.match(/osslifecycle\=([a-z]+)/im);
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
        console.log(e);
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
      }
    });
}));

// Shippable integration
camp.route(/^\/shippable\/([^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var defaultOpts = {
    colorA: '#555555',
    successLabel: 'passing',
    successColor: '#44CC11',
    failLabel: 'failing',
    failColor: '#DC5F59',
    cancelledLabel: 'cancelled',
    cancelledColor: '#6BAFBD',
    unstableLabel: 'unstable',
    unstableColor: '#CEA61B',
    pendingLabel: 'pending',
    pendingColor: '#5183A0',
    skippedLabel: 'skipped',
    skippedColor: '#F8A97D',
    noBuildLabel: 'none',
    noBuildColor: '#A1ABAB',
    inaccessibleLabel: 'inaccessible',
    inaccessibleColor: '#A1ABAB'
  };

  var badgeData = getBadgeData('build', data);
  delete badgeData.colorscheme;

  // overwrite the default options if present in query parameters
  Object.keys(defaultOpts).forEach(
    function (key) {
      defaultOpts[key] = data[key] || defaultOpts[key];
    }
  );

  badgeData.colorA = defaultOpts.colorA;
  badgeData.colorB = defaultOpts.noBuildColor;

  var project = match[1];  // eg, 54d119db5ab6cc13528ab183
  var branch = match[2];
  var format = match[3];
  var url = 'https://api.shippable.com/projects/' + project + '/badge';

  if (branch != null) {
    url += '?branch=' + branch;
  }

  fetchFromSvg(request, url, function (err, res) {
    if (err != null) {
      badgeData.text[1] = defaultOpts.inaccessibleLabel;
      sendBadge(format, badgeData);
      return;
    }

    try {
      switch (res) {
        case 'none':
          badgeData.text[1] = defaultOpts.noBuildLabel;
          badgeData.colorB = defaultOpts.noBuildColor;
          break;
        case 'shippable':
          badgeData.text[1] = defaultOpts.successLabel;
          badgeData.colorB = defaultOpts.successColor;
          break;
        case 'failed':
          badgeData.text[1] = defaultOpts.failLabel;
          badgeData.colorB = defaultOpts.failColor;
          break;
        case 'cancelled':
          badgeData.text[1] = defaultOpts.cancelledLabel;
          badgeData.colorB = defaultOpts.cancelledColor;
          break;
        case 'pending':
          badgeData.text[1] = defaultOpts.pendingLabel;
          badgeData.colorB = defaultOpts.pendingColor;
          break;
        case 'skipped':
          badgeData.text[1] = defaultOpts.skippedLabel;
          badgeData.colorB = defaultOpts.skippedColor;
          break;
        case 'unstable':
          badgeData.text[1] = defaultOpts.unstableLabel;
          badgeData.colorB = defaultOpts.unstableColor;
          break;
        default:
          badgeData.text[1] = 'invalid';
          badgeData.colorB = defaultOpts.noBuildColor;
      }
      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'invalid';
      badgeData.colorB = defaultOpts.noBuildColor;
      sendBadge(format, badgeData);
    }
  });
}));

// Wercker integration
camp.route(/^\/wercker\/ci\/([a-fA-F0-9]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectId = match[1];  // eg, `54330318b4ce963d50020750`
  var format = match[2];
  var options = {
    method: 'GET',
    json: true,
    uri: 'https://app.wercker.com/getbuilds/' + projectId + '?limit=1'
  };
  var badgeData = getBadgeData('build', data);
  request(options, function(err, res, json) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var build = json[0];

      if (build.status === 'finished') {
        if (build.result === 'passed') {
          badgeData.colorscheme = 'brightgreen';
          badgeData.text[1] = 'passing';
        } else {
          badgeData.colorscheme = 'red';
          badgeData.text[1] = build.result;
        }
      } else {
        badgeData.text[1] = build.status;
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Wercker V3 integration
camp.route(/^\/wercker\/ci\/(.+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var owner = match[1];
  var application = match[2];
  var format = match[3];
  var options = {
    method: 'GET',
    json: true,
    uri: 'https://app.wercker.com/api/v3/applications/' + owner + '/' + application + '/builds?limit=1'
  };
  var badgeData = getBadgeData('build', data);
  request(options, function(err, res, json) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var build = json[0];

      if (build.status === 'finished') {
        if (build.result === 'passed') {
          badgeData.colorscheme = 'brightgreen';
          badgeData.text[1] = 'passing';
        } else {
          badgeData.colorscheme = 'red';
          badgeData.text[1] = build.result;
        }
      } else {
        badgeData.text[1] = build.status;
      }
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
      }
    },
    'dv': {
      name: 'downloads',
      version: true,
      process: function (data, badgeData) {
        var downloads = data.version? data.version.downloads: data.versions[0].downloads;
        version = data.version && data.version.num;
        badgeData.text[1] = metric(downloads) + (version? ' version ' + version: ' latest version');
        badgeData.colorscheme = downloadCountColor(downloads);
      }
    },
    'v': {
      name: 'crates.io',
      version: true,
      process: function (data, badgeData) {
        version = data.version? data.version.num: data.crate.max_version;
        var vdata = versionColor(version);
        badgeData.text[1] = vdata.version;
        badgeData.colorscheme = vdata.color;
      }
    },
    'l': {
      name: 'license',
      version: false,
      process: function (data, badgeData) {
        badgeData.text[1] = data.crate.license;
        badgeData.colorscheme = 'blue';
      }
    }
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

// AppVeyor CI integration.
camp.route(/^\/appveyor\/ci\/([^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, `gruntjs/grunt`.
  var branch = match[2];
  var format = match[3];
  var apiUrl = 'https://ci.appveyor.com/api/projects/' + repo;
  if (branch != null) {
    apiUrl += '/branch/' + branch;
  }
  var badgeData = getBadgeData('build', data);
  badgeData.logo = badgeData.logo || logos['appveyor'];
  request(apiUrl, { headers: { 'Accept': 'application/json' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      var data = JSON.parse(buffer);
      var status = data.build.status;
      if (status === 'success') {
        badgeData.text[1] = 'passing';
        badgeData.colorscheme = 'brightgreen';
      } else if (status !== 'running' && status !== 'queued') {
        badgeData.text[1] = 'failing';
        badgeData.colorscheme = 'red';
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

function teamcity_badge(url, buildId, advanced, format, data, sendBadge) {
  var apiUrl = url + '/app/rest/builds/buildType:(id:' + buildId + ')?guest=1';
  var badgeData = getBadgeData('build', data);
  request(apiUrl, { headers: { 'Accept': 'application/json' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      var data = JSON.parse(buffer);
      if (advanced)
        badgeData.text[1] = (data.statusText || data.status || '').toLowerCase();
      else
        badgeData.text[1] = (data.status || '').toLowerCase();
      if (data.status === 'SUCCESS') {
        badgeData.colorscheme = 'brightgreen';
        badgeData.text[1] = 'passing';
      } else {
        badgeData.colorscheme = 'red';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}

// Old url for CodeBetter TeamCity instance.
camp.route(/^\/teamcity\/codebetter\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var buildType = match[1];  // eg, `bt428`.
  var format = match[2];
  teamcity_badge('http://teamcity.codebetter.com', buildType, false, format, data, sendBadge);
}));

// Generic TeamCity instance
camp.route(/^\/teamcity\/(http|https)\/(.*)\/(s|e)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[1];
  var serverUrl = match[2];
  var advanced = (match[3] == 'e');
  var buildType = match[4];  // eg, `bt428`.
  var format = match[5];
  teamcity_badge(scheme + '://' + serverUrl, buildType, advanced, format, data, sendBadge);
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
camp.route(/^\/sonar\/(http|https)\/(.*)\/(.*)\/(.*)\.(svg|png|gif|jpg|json)$/,
    cache(function(data, match, sendBadge, request) {
      var scheme = match[1];
      var serverUrl = match[2];  // eg, `sonar.qatools.ru`.
      var buildType = match[3];  // eg, `ru.yandex.qatools.allure:allure-core:master`.
      var metricName = match[4];
      var format = match[5];

      var sonarMetricName = metricName;
      if (metricName === 'tech_debt') {
        //special condition for backwards compatibility
        sonarMetricName = 'sqale_debt_ratio';
      }

      var options = {
        uri: scheme + '://' + serverUrl + '/api/resources?resource=' + buildType
          + '&depth=0&metrics=' + encodeURIComponent(sonarMetricName) + '&includetrends=true',
        headers: {
          Accept: 'application/json'
        }
      };
      if (serverSecrets && serverSecrets.sonarqube_token) {
        options.auth = {
          user: serverSecrets.sonarqube_token
        };
      }

      var badgeData = getBadgeData(metricName.replace(/_/g, ' '), data);

      request(options, function(err, res, buffer) {
        if (err != null) {
          badgeData.text[1] = 'inaccessible';
          sendBadge(format, badgeData);
        }
        try {
          var data = JSON.parse(buffer);

          var value = data[0].msr[0].val;

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
            badgeData.text[1] = value + '%';
            if (value >= 100) {
              badgeData.colorscheme = 'red';
            } else if (value >= 50) {
              badgeData.colorscheme = 'orange';
            } else if (value >= 20) {
              badgeData.colorscheme = 'yellow';
            } else if (value >= 10) {
              badgeData.colorscheme = 'yellowgreen';
            } else if (value >= 0) {
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

// Gratipay integration.
camp.route(/^\/(?:gittip|gratipay(\/user|\/team)?)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];  // eg, `user`.
  var user = match[2];  // eg, `dougwilson`.
  var format = match[3];
  if (type === '') { type = '/user'; }
  if (type === '/user') { user = '~' + user; }
  var apiUrl = 'https://gratipay.com/' + user + '/public.json';
  var badgeData = getBadgeData('tips', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.gratipay;
  }
  request(apiUrl, function dealWithData(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var receiving = data.receiving || data.taking;
      if (receiving) {
        badgeData.text[1] = '$' + metric(receiving) + '/week';
        if (receiving === 0) {
          badgeData.colorscheme = 'red';
        } else if (receiving < 10) {
          badgeData.colorscheme = 'yellow';
        } else if (receiving < 100) {
          badgeData.colorscheme = 'green';
        } else {
          badgeData.colorscheme = 'brightgreen';
        }
        sendBadge(format, badgeData);
      } else {
        badgeData.text[1] = 'anonymous';
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
      badgeData.text[1] = metric(+data.count[data.count.length-1]);
      badgeData.colorscheme = 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));



// Bountysource integration.
camp.route(/^\/bountysource\/team\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var team = match[1];  // eg, `mozilla-core`.
  var type = match[2];  // eg, `activity`.
  var format = match[3];
  var url = 'https://api.bountysource.com/teams/' + team;
  var options = {
    headers: { 'Accept': 'application/vnd.bountysource+json; version=2' } };
  var badgeData = getBadgeData('bounties', data);
  request(url, options, function dealWithData(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (type === 'activity') {
        var activity = data.activity_total;
        badgeData.colorscheme = 'brightgreen';
        badgeData.text[1] = activity;
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// HHVM integration.
camp.route(/^\/hhvm\/([^\/]+\/[^\/]+)(\/.+)?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, `symfony/symfony`.
  var branch = match[2];// eg, `/2.4.0.0`.
  var format = match[3];
  var apiUrl = 'http://hhvm.h4cc.de/badge/' + user + '.json';
  if (branch) {
    // Remove the leading slash.
    apiUrl += '?branch=' + branch.slice(1);
  }
  var badgeData = getBadgeData('hhvm', data);
  request(apiUrl, function dealWithData(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var status = data.hhvm_status;
      if (status === 'not_tested') {
        badgeData.colorscheme = 'red';
        badgeData.text[1] = 'not tested';
      } else if (status === 'partial') {
        badgeData.colorscheme = 'yellow';
        badgeData.text[1] = 'partially tested';
      } else if (status === 'tested') {
        badgeData.colorscheme = 'brightgreen';
        badgeData.text[1] = 'tested';
      } else {
        badgeData.text[1] = 'maybe untested';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// SensioLabs.
camp.route(/^\/sensiolabs\/i\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectUuid = match[1];
  var format = match[2];
  var options = {
    method: 'GET',
    uri: 'https://insight.sensiolabs.com/api/projects/' + projectUuid,
    headers: {
      Accept: 'application/vnd.com.sensiolabs.insight+xml'
    }
  };

  if (serverSecrets && serverSecrets.sl_insight_userUuid) {
    options.auth = {
      user: serverSecrets.sl_insight_userUuid,
      pass: serverSecrets.sl_insight_apiToken
    };
  }

  var badgeData = getBadgeData('check', data);

  request(options, function(err, res, body) {
    if (err != null || res.statusCode !== 200) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    var matchStatus = body.match(/\<status\>\<\!\[CDATA\[([a-z]+)\]\]\>\<\/status\>/im);
    var matchGrade = body.match(/\<grade\>\<\!\[CDATA\[([a-z]+)\]\]\>\<\/grade\>/im);

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

      var vdata;
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
        vdata = versionColor(stableVersion);
        badgeText = vdata.version;
        badgeColor = vdata.color;
        break;
      case 'vpre':
        var unstableVersion = phpLatestVersion(versions);
        //if (!!aliasesMap[unstableVersion]) {
        //  unstableVersion = aliasesMap[unstableVersion];
        //}
        vdata = versionColor(unstableVersion);
        badgeText = vdata.version;
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

// CDNJS version integration
camp.route(/^\/cdnjs\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var library = encodeURIComponent(match[1]);  // eg, "express" or "@user/express"
  var format = match[2];
  var apiUrl = 'https://api.cdnjs.com/libraries/' + library + '?fields=version';
  var badgeData = getBadgeData('cdnjs', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var version = JSON.parse(buffer).version || 0;
      var vdata = versionColor(version);
      badgeData.text[1] = vdata.version;
      badgeData.colorscheme = vdata.color;
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
    }
  });
}));

// npm weekly download integration.
mapNpmDownloads('dw', 'last-week');

// npm monthly download integration.
mapNpmDownloads('dm', 'last-month');

// npm yearly download integration
mapNpmDownloads('dy', 'last-year');

// npm total download integration.
camp.route(/^\/npm\/dt\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var pkg = encodeURIComponent(match[1]);  // eg, "express" or "@user/express"
  var format = match[2];
  var apiUrl = 'https://api.npmjs.org/downloads/range/1000-01-01:3000-01-01/' + pkg; // use huge range, will need to fix this in year 3000 :)
  var badgeData = getBadgeData('downloads', data);
  request(apiUrl, function (err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var totalDownloads = 0;

      var downloads = JSON.parse(buffer).downloads || 0;
      for (var index = 0; index < downloads.length; index++) {
        totalDownloads = totalDownloads + downloads[index].downloads;
      }

      badgeData.text[1] = metric(totalDownloads);
      if (totalDownloads === 0) {
        badgeData.colorscheme = 'red';
      } else {
        badgeData.colorscheme = 'brightgreen';
      }
      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// npm version integration.
camp.route(/^\/npm\/v\/(@[^\/]*)?\/?([^\/]*)\/?([^\/]*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scope = match[1];   // "@user"
  var repo = match[2];    // "express"
  var tag = match[3];     // "next"
  var format = match[4];  // "svg"
  var pkg = encodeURIComponent(scope
    ? scope + '/' + repo
    : repo);
  var name = 'npm';
  if (tag) {
    name += '@' + tag;
  } else {
    tag = 'latest';
  }
  var apiUrl = 'https://registry.npmjs.org/-/package/' + pkg + '/dist-tags';
  var badgeData = getBadgeData(name, data);
  // Using the Accept header because of this bug:
  // <https://github.com/npm/npmjs.org/issues/163>
  request(apiUrl, { headers: { 'Accept': '*/*' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var version = data[tag];
      var vdata = versionColor(version);
      badgeData.text[1] = vdata.version;
      badgeData.colorscheme = vdata.color;
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// npm license integration.
camp.route(/^\/npm\/l\/(?:@([^\/]+)\/)?([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  const scope = match[1];        // "user" (when a scope "@user" is supplied)
  const packageName = match[2];  // "express"
  const format = match[3];       // "svg"
  let apiUrl;
  if (scope === undefined) {
    // e.g. https://registry.npmjs.org/express/latest
    // Use this endpoint as an optimization. It covers the vast majority of
    // these badges, and the response is smaller.
    apiUrl = `https://registry.npmjs.org/${packageName}/latest`;
  } else {
    // e.g. https://registry.npmjs.org/@cedx%2Fgulp-david
    // because https://registry.npmjs.org/@cedx%2Fgulp-david/latest does not work
    const path = encodeURIComponent(`${scope}/${packageName}`);
    apiUrl = `https://registry.npmjs.org/@${path}`;
  }
  const badgeData = getBadgeData('license', data);
  request(apiUrl, { headers: { 'Accept': '*/*' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      const data = JSON.parse(buffer);
      let license;
      if (scope === undefined) {
        license = data.license;
      } else {
        const latestVersion = data['dist-tags'].latest;
        license = data.versions[latestVersion].license;
      }
      if (Array.isArray(license)) {
        license = license.join(', ');
      } else if (typeof license == 'object') {
        license = license.type;
      }
      badgeData.text[1] = license;
      badgeData.colorscheme = 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// npm node version integration.
camp.route(/^\/node\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = encodeURIComponent(match[1]);  // eg, "express" or "@user/express"
  var format = match[2];
  var apiUrl = 'https://registry.npmjs.org/' + repo + '/latest';
  var badgeData = getBadgeData('node', data);
  // Using the Accept header because of this bug:
  // <https://github.com/npm/npmjs.org/issues/163>
  request(apiUrl, { headers: { 'Accept': '*/*' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (data.engines && data.engines.node) {
        var versionRange = data.engines.node;
        badgeData.text[1] = versionRange;
        regularUpdate('http://nodejs.org/dist/latest/SHASUMS256.txt',
          (24 * 3600 * 1000),
          function(shasums) {
            // tarball index start, tarball index end
            var taris = shasums.indexOf('node-v');
            var tarie = shasums.indexOf('\n', taris);
            var tarball = shasums.slice(taris, tarie);
            var version = tarball.split('-')[1];
            return version;
          }, function(err, version) {
            if (err != null) { sendBadge(format, badgeData); return; }
            try {
              if (semver.satisfies(version, versionRange)) {
                badgeData.colorscheme = 'brightgreen';
              } else if (semver.gtr(version, versionRange)) {
                badgeData.colorscheme = 'yellow';
              } else {
                badgeData.colorscheme = 'orange';
              }
            } catch(e) { }
            sendBadge(format, badgeData);
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

// Bintray version integration
camp.route(/^\/bintray\/v\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var path = match[1]; // :subject/:repo/:package (e.g. asciidoctor/maven/asciidoctorj)
  var format = match[2];

  var options = {
    method: 'GET',
    uri: 'https://bintray.com/api/v1/packages/' + path + '/versions/_latest',
    headers: {
      Accept: 'application/json'
    }
  };

  if (serverSecrets && serverSecrets.bintray_user) {
    options.auth = {
      user: serverSecrets.bintray_user,
      pass: serverSecrets.bintray_apikey
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
      var vdata = versionColor(data.name);
      badgeData.text[1] = vdata.version;
      badgeData.colorscheme = 'brightgreen';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Clojars version integration
camp.route(/^\/clojars\/v\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var clojar = match[1];  // eg, `prismic` or `foo/bar`.
  var format = match[2];
  var apiUrl = 'https://clojars.org/' + clojar + '/latest-version.json';
  var badgeData = getBadgeData('clojars', data);
  request(apiUrl, function(err, res, buffer) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      badgeData.text[1] = "[" + clojar + " \"" + data.version + "\"]";
      badgeData.colorscheme = versionColor(data.version).color;
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
      var version = data.results[0].version;
      var vdata = versionColor(version);
      badgeData.text[1] = 'v' + version;
      badgeData.colorscheme = vdata.color;
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Gem version integration.
camp.route(/^\/gem\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, `formatador`.
  var format = match[2];
  var apiUrl = 'https://rubygems.org/api/v1/gems/' + repo + '.json';
  var badgeData = getBadgeData('gem', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var version = data.version;
      var vdata = versionColor(version);
      badgeData.text[1] = vdata.version;
      badgeData.colorscheme = vdata.color;
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Gem download count
camp.route(/^\/gem\/(dt|dtv|dv)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];  // either dt, dtv or dv.
  var repo = match[2];  // eg, "rails"
  var splited_url = repo.split('/');
  repo = splited_url[0];
  var version = (splited_url.length > 1)
    ? splited_url[splited_url.length - 1]
    : null;
  version = (version === "stable") ? version : semver.valid(version);
  var format = match[3];
  var badgeData = getBadgeData('downloads', data);
  if  (info === "dv"){
    apiUrl = 'https://rubygems.org/api/v1/versions/' + repo + '.json';
  } else {
    var  apiUrl = 'https://rubygems.org/api/v1/gems/' + repo + '.json';
  }
  var parameters = {
    headers: {
      'Accept': 'application/atom+json,application/json'
    }
  };
  request(apiUrl, parameters, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var downloads;
      if (info === "dt") {
        downloads = metric(data.downloads);
      } else if (info === "dtv") {
        downloads = metric(data.version_downloads) + " latest version";
      } else if (info === "dv") {
        downloads = "invalid";

        var version_data;
        if (version !== null && version === "stable") {

          var versions = data.filter(function(ver) {
            return ver.prerelease === false;
          }).map(function(ver) {
            return ver.number;
          });
          // Found latest stable version.
          var stable_version = latestVersion(versions);
          version_data = data.filter(function(ver) {
            return ver.number === stable_version;
          })[0];
          downloads = metric(version_data.downloads_count) + " stable version";

        } else if (version !== null) {

          version_data = data.filter(function(ver) {
            return ver.number === version;
          })[0];

          downloads = metric(version_data.downloads_count)
            + " version " + version;
        }
      } else { downloads = "invalid"; }
      badgeData.text[1] = downloads;
      badgeData.colorscheme = downloadCountColor(downloads);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Gem owner stats
camp.route(/^\/gem\/u\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1]; // eg, "raphink"
  var format = match[2];
  var url = 'https://rubygems.org/api/v1/owners/' + user + '/gems.json';
  var badgeData = getBadgeData('gems', data);
  request(url, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var count = data.length;
      badgeData.colorscheme = floorCountColor(count, 10, 50, 100);
      badgeData.text[1] = count;
      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));


// Gem ranking
camp.route(/^\/gem\/(rt|rd)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // either rt or rd
  var repo = match[2]; // eg, "rspec-puppet-facts"
  var format = match[3];
  var url = 'http://bestgems.org/api/v1/gems/' + repo;
  var totalRank = (info === 'rt');
  var dailyRank = (info === 'rd');
  if (totalRank) {
    url += '/total_ranking.json';
  } else if (dailyRank) {
    url += '/daily_ranking.json';
  }
  var badgeData = getBadgeData('rank', data);
  request(url, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var rank;
      if (totalRank) {
        rank = data[0].total_ranking;
      } else if (dailyRank) {
        rank = data[0].daily_ranking;
      }
      var count = Math.floor(100000 / rank);
      badgeData.colorscheme = floorCountColor(count, 10, 50, 100);
      badgeData.text[1] = ordinalNumber(rank);
      badgeData.text[1] += totalRank? '': ' daily';
      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// PyPI integration.
camp.route(/^\/pypi\/([^\/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];
  var egg = match[2];  // eg, `gevent`, `Django`.
  var format = match[3];
  var apiUrl = 'https://pypi.python.org/pypi/' + egg + '/json';
  var badgeData = getBadgeData('pypi', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (info.charAt(0) === 'd') {
        badgeData.text[0] = getLabel('downloads', data);
        var downloads;
        switch (info.charAt(1)) {
          case 'm':
            downloads = data.info.downloads.last_month;
            badgeData.text[1] = metric(downloads) + '/month';
            break;
          case 'w':
            downloads = data.info.downloads.last_week;
            badgeData.text[1] = metric(downloads) + '/week';
            break;
          case 'd':
            downloads = data.info.downloads.last_day;
            badgeData.text[1] = metric(downloads) + '/day';
            break;
        }
        badgeData.colorscheme = downloadCountColor(downloads);
        sendBadge(format, badgeData);
      } else if (info === 'v') {
        var version = data.info.version;
        var vdata = versionColor(version);
        badgeData.text[1] = vdata.version;
        badgeData.colorscheme = vdata.color;
        sendBadge(format, badgeData);
      } else if (info === 'l') {
        var license = data.info.license;
        badgeData.text[0] = 'license';
        if (license === null || license === 'UNKNOWN') {
          badgeData.text[1] = 'Unknown';
        } else {
          badgeData.text[1] = license;
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      } else if (info === 'wheel') {
        let releases = data.releases[data.info.version];
        let hasWheel = false;
        for (let i = 0; i < releases.length; i++) {
          if (releases[i].packagetype === 'wheel' ||
              releases[i].packagetype === 'bdist_wheel') {
            hasWheel = true;
            break;
          }
        }
        badgeData.text[0] = 'wheel';
        badgeData.text[1] = hasWheel ? 'yes' : 'no';
        badgeData.colorscheme = hasWheel ? 'brightgreen' : 'red';
        sendBadge(format, badgeData);
      } else if (info === 'format') {
        let releases = data.releases[data.info.version];
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
        badgeData.text[0] = 'format';
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
        var versions = [];
        let pattern = /^Programming Language \:\: Python \:\: ([\d\.]+)$/;
        for (let i = 0; i < data.info.classifiers.length; i++) {
          var matched = pattern.exec(data.info.classifiers[i]);
          if (matched && matched[1]) {
            versions.push(matched[1]);
          }
        }
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
        badgeData.text[0] = 'python';
        badgeData.text[1] = versions.sort().join(', ');
        badgeData.colorscheme = 'blue';
        sendBadge(format, badgeData);
      } else if (info === 'implementation') {
        var implementations = [];
        let pattern = /^Programming Language \:\: Python \:\: Implementation \:\: (\S+)$/;
        for (let i = 0; i < data.info.classifiers.length; i++) {
          let matched = pattern.exec(data.info.classifiers[i]);
          if (matched && matched[1]) {
            implementations.push(matched[1].toLowerCase());
          }
        }
        if (!implementations.length) {
          implementations.push('cpython');  // assume CPython
        }
        badgeData.text[0] = 'implementation';
        badgeData.text[1] = implementations.sort().join(', ');
        badgeData.colorscheme = 'blue';
        sendBadge(format, badgeData);
      } else if (info === 'status') {
        let pattern = /^Development Status \:\: ([1-7]) - (\S+)$/;
        var statusColors = {
            '1': 'red', '2': 'red', '3': 'red', '4': 'yellow',
            '5': 'brightgreen', '6': 'brightgreen', '7': 'red'};
        var statusCode = '1', statusText = 'unknown';
        for (let i = 0; i < data.info.classifiers.length; i++) {
          let matched = pattern.exec(data.info.classifiers[i]);
          if (matched && matched[1] && matched[2]) {
            statusCode = matched[1];
            statusText = matched[2].toLowerCase().replace('-', '--');
            if (statusText === 'production/stable') {
              statusText = 'stable';
            }
            break;
          }
        }
        badgeData.text[0] = 'status';
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

// Dart's pub version integration.
camp.route(/^\/pub\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1]; // eg, "box2d"
  var format = match[2];
  var apiUrl = 'https://pub.dartlang.org/packages/' + userRepo + '.json';
  var badgeData = getBadgeData('pub', data);
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
      var version = latestVersion(versions);
      var vdata = versionColor(version);
      badgeData.text[1] = vdata.version;
      badgeData.colorscheme = vdata.color;
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Hex.pm integration.
camp.route(/^\/hexpm\/([^\/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];
  var repo = match[2];  // eg, `httpotion`.
  var format = match[3];
  var apiUrl = 'https://hex.pm/api/packages/' + repo;
  var badgeData = getBadgeData('hex', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (info.charAt(0) === 'd') {
        badgeData.text[0] = getLabel('downloads', data);
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
        var version = data.releases[0].version;
        var vdata = versionColor(version);
        badgeData.text[1] = vdata.version;
        badgeData.colorscheme = vdata.color;
        sendBadge(format, badgeData);
      } else if (info == 'l') {
        var license = (data.meta.licenses || []).join(', ');
        badgeData.text[0] = 'license';
        if ((data.meta.licenses || []).length > 1) badgeData.text[0] += 's';
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
camp.route(/^\/coveralls\/([^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, `jekyll/jekyll`.
  var branch = match[2];
  var format = match[3];
  var apiUrl = {
    url: 'http://badge.coveralls.io/repos/' + userRepo + '/badge.png',
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
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
}));

// Codecov integration.
camp.route(/^\/codecov\/c\/(?:token\/(\w+))?[+\/]?([^\/]+\/[^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var token = match[1];
  var userRepo = match[2];  // eg, `github/codecov/example-python`.
  var branch = match[3];
  var format = match[4];
  var apiUrl = {
    url: 'https://codecov.io/' + userRepo + '/coverage.svg',
    followRedirect: false,
    method: 'HEAD',
  };
  // Query Params
  var queryParams = {};
  if (branch) {
    queryParams.branch = branch;
  }
  if (token) {
    queryParams.token = token;
  }
  apiUrl.url += '?' + querystring.stringify(queryParams);
  var badgeData = getBadgeData('coverage', data);
  request(apiUrl, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    try {
      // X-Coverage header returns: n/a if 404/401 else range(0, 100).
      // It can also yield a 302 Found with an "unknown" X-Coverage.
      var coverage = res.headers['x-coverage'];
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
  }).on('error', function(e) {
    badgeData.text[1] = 'inaccessible';
    sendBadge(format, badgeData);
  });
}));

// Code Climate coverage integration
camp.route(/^\/codeclimate\/coverage\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, `github/triAGENS/ashikawa-core`.
  var format = match[2];
  var options = {
    method: 'HEAD',
    uri: 'https://codeclimate.com/' + userRepo + '/coverage.png',
  };
  var badgeData = getBadgeData('coverage', data);
  request(options, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var score = res.headers['content-disposition']
                     .match(/filename=".*coverage_(.+)\.png"/)[1];
      if (!score) {
        badgeData.text[1] = 'malformed';
        sendBadge(format, badgeData);
        return;
      }
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
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
    }
  });
}));

// Code Climate issues integration
camp.route(/^\/codeclimate\/issues\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, `github/me-and/mdf`.
  var format = match[2];
  var options = 'https://codeclimate.com/' + userRepo + '/badges/issue_count.svg';
  var badgeData = getBadgeData('issues', data);
  request(options, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var count = buffer.match(/>([0-9]+) issues?/)[1];
      if (!count) {
        badgeData.text[1] = 'malformed';
        sendBadge(format, badgeData);
        return;
      }
      badgeData.text[1] = count;
      if (count == 0) {
        badgeData.colorscheme = 'brightgreen';
      } else if (count < 5) {
        badgeData.colorscheme = 'green';
      } else if (count < 10) {
        badgeData.colorscheme = 'yellowgreen';
      } else if (count < 20) {
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

// Code Climate integration
camp.route(/^\/codeclimate\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, `github/kabisaict/flow`.
  var format = match[2];
  var options = {
    method: 'HEAD',
    uri: 'https://codeclimate.com/' + userRepo + '.png',
  };
  var badgeData = getBadgeData('code climate', data);
  request(options, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var statusMatch = res.headers['content-disposition']
                           .match(/filename=".*code_climate-(.+)\.png"/);
      if (!statusMatch) {
        badgeData.text[1] = 'unknown';
        sendBadge(format, badgeData);
        return;
      }
      var state = statusMatch[1].replace('-', '.');
      var score = +state;
      badgeData.text[1] = state;
      if (score == 4) {
        badgeData.colorscheme = 'brightgreen';
      } else if (score > 3) {
        badgeData.colorscheme = 'green';
      } else if (score > 2) {
        badgeData.colorscheme = 'yellowgreen';
      } else if (score > 1) {
        badgeData.colorscheme = 'yellow';
      } else {
        badgeData.colorscheme = 'red';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
    }
  });
}));

// Scrutinizer coverage integration.
camp.route(/^\/scrutinizer\/coverage\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, g/phpmyadmin/phpmyadmin
  var format = match[2];
  // The repo may contain a branch, which would be unsuitable.
  var repoParts = repo.split('/');
  var branch = null;
  // Normally, there are 2 slashes in `repo` when the branch isn't specified.
  var slashesInRepo = 2;
  if (repoParts[0] === 'gp') { slashesInRepo = 1; }
  if ((repoParts.length - 1) > slashesInRepo) {
    branch = repoParts.slice(slashesInRepo + 1).join('/');
    repo = repoParts.slice(0, slashesInRepo + 1).join('/');
  }
  var apiUrl = 'https://scrutinizer-ci.com/api/repositories/' + repo;
  var badgeData = getBadgeData('coverage', data);
  request(apiUrl, {}, function(err, res, buffer) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      // Which branch are we dealing with?
      if (branch === null) { branch = data.default_branch; }
      var percentage = data.applications[branch].index._embedded
        .project.metric_values['scrutinizer.test_coverage'] * 100;
      badgeData.text[1] = percentage.toFixed(0) + '%';
      badgeData.colorscheme = coveragePercentageColor(percentage);
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Scrutinizer build integration.
camp.route(/^\/scrutinizer\/build\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, g/phpmyadmin/phpmyadmin
  var format = match[2];
  // The repo may contain a branch, which would be unsuitable.
  var repoParts = repo.split('/');
  var branch = null;
  // Normally, there are 2 slashes in `repo` when the branch isn't specified.
  var slashesInRepo = 2;
  if (repoParts[0] === 'gp') { slashesInRepo = 1; }
  if ((repoParts.length - 1) > slashesInRepo) {
    branch = repoParts.slice(slashesInRepo + 1).join('/');
    repo = repoParts.slice(0, slashesInRepo + 1).join('/');
  }
  var apiUrl = 'https://scrutinizer-ci.com/api/repositories/' + repo;
  var badgeData = getBadgeData('build', data);
  request(apiUrl, {}, function(err, res, buffer) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      // Which branch are we dealing with?
      if (branch === null) { branch = data.default_branch; }
      var status = data.applications[branch].build_status.status;
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
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Scrutinizer integration.
camp.route(/^\/scrutinizer\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, g/phpmyadmin/phpmyadmin
  var format = match[2];
  // The repo may contain a branch, which would be unsuitable.
  var repoParts = repo.split('/');
  var branch = null;
  // Normally, there are 2 slashes in `repo` when the branch isn't specified.
  var slashesInRepo = 2;
  if (repoParts[0] === 'gp') { slashesInRepo = 1; }
  if ((repoParts.length - 1) > slashesInRepo) {
    branch = repoParts.slice(slashesInRepo + 1).join('/');
    repo = repoParts.slice(0, slashesInRepo + 1).join('/');
  }
  var apiUrl = 'https://scrutinizer-ci.com/api/repositories/' + repo;
  var badgeData = getBadgeData('code quality', data);
  request(apiUrl, {}, function(err, res, buffer) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      // Which branch are we dealing with?
      if (branch === null) { branch = data.default_branch; }
      var score = data.applications[branch].index._embedded
        .project.metric_values['scrutinizer.quality'];
      score = Math.round(score * 100) / 100;
      badgeData.text[1] = score;
      badgeData.colorscheme = 'blue';
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

      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// David integration
camp.route(/^\/david\/(dev\/|optional\/|peer\/)?(.+?)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var dev = match[1];
  if (dev != null) { dev = dev.slice(0, -1); }  // 'dev', 'optional' or 'peer'.
  // eg, `expressjs/express`, `webcomponents/generator-element`.
  var userRepo = match[2];
  var format = match[3];
  var options = 'https://david-dm.org/' + userRepo + '/'
    + (dev ? (dev + '-') : '') + 'info.json';
  var badgeData = getBadgeData( (dev? (dev+'D') :'d') + 'ependencies', data);
  request(options, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
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
}));

// Gemnasium integration
camp.route(/^\/gemnasium\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, `jekyll/jekyll`.
  var format = match[2];
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
      badgeData.text[0] = data.label || nameMatch;
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
camp.route(/^\/codacy\/(?:grade\/)?(?!coverage\/)([^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectId = match[1];  // eg. e27821fb6289410b8f58338c7e0bc686
  var branch = match[2];
  var format = match[3];

  var queryParams = {};
  if (branch) {
    queryParams.branch = branch;
  }
  var query = querystring.stringify(queryParams);
  var url = 'https://www.codacy.com/project/badge/grade/' + projectId + '?' + query;
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

camp.route(/^\/codacy\/coverage\/(?!grade\/)([^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectId = match[1];  // eg. e27821fb6289410b8f58338c7e0bc686
  var branch = match[2];
  var format = match[3];

  var queryParams = {};
  if (branch) {
    queryParams.branch = branch;
  }
  var query = querystring.stringify(queryParams);
  var url = 'https://www.codacy.com/project/badge/coverage/' + projectId + '?' + query;
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
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
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
      var version = versionLines[0].replace(/\s+/, '').split(/:/)[1];
      badgeData.text[1] = 'v' + version;
      if (version[0] === '0') {
        badgeData.colorscheme = 'orange';
      } else {
        badgeData.colorscheme = 'blue';
      }
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
  var repo = match[1];  // eg, `lens`.
  var format = match[2];
  var apiUrl = 'http://packdeps.haskellers.com/feed/' + repo;
  var badgeData = getBadgeData('hackage-deps', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    try {
      var outdatedStr = "Outdated dependencies for " + repo + " ";
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
}));

// CocoaPods version integration.
camp.route(/^\/cocoapods\/(v|p|l)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];
  var spec = match[2];  // eg, AFNetworking
  var format = match[3];
  var apiUrl = 'https://trunk.cocoapods.org/api/v1/pods/' + spec + '/specs/latest';
  var badgeData = getBadgeData('pod', data);
  badgeData.colorscheme = null;
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var version = data.version;
      var license;
      if (typeof data.license === 'string') {
        license = data.license;
      } else { license = data.license.type; }

      var platforms = Object.keys(data.platforms || {
        'ios' : '5.0',
        'osx' : '10.7'
      }).join(' | ');
      version = version.replace(/^v/, "");
      if (type === 'v') {
        badgeData.text[1] = version;
        if (/^\d/.test(badgeData.text[1])) {
          badgeData.text[1] = 'v' + version;
        }
        badgeData.colorB = '#5BA7E9';
      } else if (type === 'p') {
        badgeData.text[0] = 'platform';
        badgeData.text[1] = platforms;
        badgeData.colorB = '#989898';
      } else if (type === 'l') {
        badgeData.text[0] = 'license';
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
  var apiUrl = 'http://metrics.cocoapods.org/api/v1/pods/' + spec;
  var badgeData = getBadgeData('pod', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var percentage = data.cocoadocs.doc_percent;
      badgeData.colorscheme = coveragePercentageColor(percentage);
      badgeData.text[0] = 'docs';
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
  var apiUrl = 'http://metrics.cocoapods.org/api/v1/pods/' + spec;
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
  var apiUrl = 'http://metrics.cocoapods.org/api/v1/pods/' + spec;
  var badgeData = getBadgeData('apps', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
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

// GitHub tag integration.
camp.route(/^\/github\/tag\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, expressjs/express
  var repo = match[2];
  var format = match[3];
  var apiUrl = githubApiUrl + '/repos/' + user + '/' + repo + '/tags';
  var badgeData = getBadgeData('tag', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  githubAuth.request(request, apiUrl, {}, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var versions = data.map(function(e) { return e.name; });
      var tag = latestVersion(versions);
      var vdata = versionColor(tag);
      badgeData.text[1] = vdata.version;
      badgeData.colorscheme = vdata.color;
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'none';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub contributors integration.
camp.route(/^\/github\/contributors(-anon)?\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var isAnon = match[1];
  var user = match[2];  // eg, qubyte/rubidium
  var repo = match[3];
  var format = match[4];
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo + '/contributors?page=1&per_page=1&anon=' + (!!isAnon);
  var badgeData = getBadgeData('contributors', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  githubAuth.request(request, apiUrl, {}, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
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
camp.route(/^\/github\/release\/([^\/]+\/[^\/]+)(?:\/(all))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, qubyte/rubidium
  var allReleases = match[2];
  var format = match[3];
  var apiUrl = githubApiUrl + '/repos/' + userRepo + '/releases';
  var badgeData = getBadgeData('release', data);
  if (allReleases === undefined) {
    apiUrl = apiUrl + '/latest';
  }
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  githubAuth.request(request, apiUrl, {}, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
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
      var vdata = versionColor(version);
      badgeData.text[1] = vdata.version;
      badgeData.colorscheme = prerelease ? 'orange' : 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'none';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub commits since integration.
camp.route(/^\/github\/commits-since\/([^\/]+)\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, SubtitleEdit
  var repo = match[2];  // eg, subtitleedit
  var version = match[3];  // eg, 3.4.7
  var format = match[4];
  var apiUrl = githubApiUrl + '/repos/' + user + '/' + repo + '/compare/' + version + '...master';
  var badgeData = getBadgeData('commits since ' + version, data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  githubAuth.request(request, apiUrl, {}, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      badgeData.text[1] = metric(data.ahead_by);
      badgeData.colorscheme = 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'none';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub release-download-count integration.
camp.route(/^\/github\/downloads\/([^\/]+)\/([^\/]+)(\/.+)?\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte/rubidium
  var repo = match[2];

  var tag = match[3];  // eg, v0.190.0, latest, null if querying all releases
  var asset_name = match[4].toLowerCase(); // eg. total, atom-amd64.deb, atom.x86_64.rpm
  var format = match[5];

  if (tag) { tag = tag.slice(1); }

  var total = true;
  if (tag) {
    total = false;
  }

  var apiUrl = githubApiUrl + '/repos/' + user + '/' + repo + '/releases';
  if (!total) {
    var release_path = tag !== 'latest' ? 'tags/' + tag : 'latest';
    apiUrl = apiUrl + '/' + release_path;
  }
  var badgeData = getBadgeData('downloads', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  githubAuth.request(request, apiUrl, {}, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      return sendBadge(format, badgeData);
    }
    try {
      var data = JSON.parse(buffer);
      var downloads = 0;

      var label;
      if (total) {
        data.forEach(function (tagData) {
          tagData.assets.forEach(function (asset) {
            if (asset_name === 'total' || asset_name === asset.name.toLowerCase()) {
              downloads += asset.download_count;
            }
          });
        });

        label = 'total';
        if (asset_name !== 'total') {
          label += ' ' + '[' + asset_name + ']';
        }
      } else {
        data.assets.forEach(function (asset) {
          if (asset_name === 'total' || asset_name === asset.name.toLowerCase()) {
            downloads += asset.download_count;
          }
        });

        label = tag !== 'latest' ?  tag : '';
        if (asset_name !== 'total') {
          label += ' ' + '[' + asset_name + ']';
        }
      }
      badgeData.text[1] = metric(downloads) + ' ' + label;
      badgeData.colorscheme = 'brightgreen';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'none';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub issues integration.
camp.route(/^\/github\/issues(-pr)?(-closed)?(-raw)?\/([^\/]+)\/([^\/]+)\/?([^\/]+)?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var isPR = !!match[1];
  var isClosed = !!match[2];
  var isRaw = !!match[3];
  var user = match[4];  // eg, badges
  var repo = match[5];  // eg, shields
  var ghLabel = match[6];  // eg, website
  var format = match[7];
  var apiUrl = githubApiUrl;
  var query = {};
  var issuesApi = false;  // Are we using the issues API instead of the repo one?
  if (isPR) {
    apiUrl += '/search/issues';
    query.q = 'is:pr is:' + (isClosed? 'closed': 'open') +
      ' repo:' + user + '/' + repo;
  } else {
    apiUrl += '/repos/' + user + '/' + repo;
    if (isClosed || ghLabel !== undefined) {
      apiUrl += '/issues';
      if (isClosed) { query.state = 'closed'; }
      if (ghLabel !== undefined) { query.labels = ghLabel; }
      issuesApi = true;
    }
  }

  var closedText = isClosed? 'closed ': '';
  var targetText = isPR? 'pull requests': 'issues';
  var badgeData = getBadgeData(closedText + targetText, data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  githubAuth.request(request, apiUrl, query, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var modifier = '';
      var issues;
      if (isPR) {
        issues = data.total_count;
      } else {
        if (issuesApi) {
          issues = data.length;
          if (res.headers['link'] &&
              res.headers['link'].indexOf('rel="last"') >= 0) {
            modifier = '+';
          }
        } else {
          issues = data.open_issues_count;
        }
      }
      var rightText = isRaw? '': (isClosed? ' closed': ' open');
      badgeData.text[1] = metric(issues) + modifier + rightText;
      badgeData.colorscheme = (issues > 0)? 'yellow': 'brightgreen';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub forks integration.
camp.route(/^\/github\/forks\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte/rubidium
  var repo = match[2];
  var format = match[3];
  var apiUrl = githubApiUrl + '/repos/' + user + '/' + repo;
  var badgeData = getBadgeData('forks', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
    badgeData.links = [
      'https://github.com/' + user + '/' + repo + '/fork',
      'https://github.com/' + user + '/' + repo + '/network',
     ];
  }
  githubAuth.request(request, apiUrl, {}, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
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
camp.route(/^\/github\/stars\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte/rubidium
  var repo = match[2];
  var format = match[3];
  var apiUrl = githubApiUrl + '/repos/' + user + '/' + repo;
  var badgeData = getBadgeData('stars', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
    badgeData.links = [
      'https://github.com/' + user + '/' + repo,
      'https://github.com/' + user + '/' + repo + '/stargazers',
     ];
  }
  githubAuth.request(request, apiUrl, {}, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
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
camp.route(/^\/github\/watchers\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte/rubidium
  var repo = match[2];
  var format = match[3];
  var apiUrl = githubApiUrl + '/repos/' + user + '/' + repo;
  var badgeData = getBadgeData('watchers', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
    badgeData.links = [
      'https://github.com/' + user + '/' + repo,
      'https://github.com/' + user + '/' + repo + '/watchers',
     ];
  }
  githubAuth.request(request, apiUrl, {}, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
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
camp.route(/^\/github\/followers\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte
  var format = match[2];
  var apiUrl = githubApiUrl + '/users/' + user;
  var badgeData = getBadgeData('followers', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  githubAuth.request(request, apiUrl, {}, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
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
camp.route(/^\/github\/license\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, mashape
  var repo = match[2];  // eg, apistatus
  var format = match[3];
  var apiUrl = githubApiUrl + '/repos/' + user + '/' + repo;
  var badgeData = getBadgeData('license', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  // Custom user-agent and accept headers are required
  // http://developer.github.com/v3/#user-agent-required
  // https://developer.github.com/v3/licenses/
  var customHeaders = {
    'User-Agent': 'Shields.io',
    'Accept': 'application/vnd.github.drax-preview+json'
  };
  request(apiUrl, { headers: customHeaders }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (res.statusCode === 404) {
        badgeData.text[1] = 'repo not found';
        sendBadge(format, badgeData);
        return;
      }
      var body = JSON.parse(buffer);
      if (body.license != null) {
        badgeData.text[1] = body.license.name;
        badgeData.colorscheme = 'blue';
        sendBadge(format, badgeData);
      } else {
        badgeData.text[1] = 'unknown license';
        sendBadge(format, badgeData);
      }
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub file size.
camp.route(/^\/github\/size\/([^\/]+)\/([^\/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, mashape
  var repo = match[2];  // eg, apistatus
  var path = match[3];
  var format = match[4];
  var apiUrl = githubApiUrl + '/repos/' + user + '/' + repo + '/contents/' + path;

  var badgeData = getBadgeData('size', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }

  githubAuth.request(request, apiUrl, {}, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (res.statusCode === 404) {
        badgeData.text[1] = 'repo or file not found';
        sendBadge(format, badgeData);
        return;
      }
      var body = JSON.parse(buffer);
      if (body.size != null) {
        badgeData.text[1] = prettyBytes(body.size);
        badgeData.colorscheme = 'green';
        sendBadge(format, badgeData);
      } else {
        badgeData.text[1] = 'unknown file';
        sendBadge(format, badgeData);
      }
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Bitbucket issues integration.
camp.route(/^\/bitbucket\/issues(-raw)?\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
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
      var data = JSON.parse(buffer);
      var issues = data.count;
      badgeData.text[1] = issues + (isRaw? '': ' open');
      badgeData.colorscheme = issues ? 'yellow' : 'brightgreen';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Bitbucket pull requests integration.
camp.route(/^\/bitbucket\/pr(-raw)?\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
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
      var data = JSON.parse(buffer);
      var pullrequests = data.size;
      badgeData.text[1] = metric(pullrequests) + (isRaw? '': ' open');
      badgeData.colorscheme = (pullrequests > 0)? 'yellow': 'brightgreen';
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
      var vdata = versionColor(version);
      badgeData.text[1] = vdata.version;
      badgeData.colorscheme = vdata.color;
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

function mapNugetFeedv2(pattern, offset, getInfo) {
  var vRegex = new RegExp('^\\/' + pattern + '\\/v\\/(.*)\\.(svg|png|gif|jpg|json)$');
  var vPreRegex = new RegExp('^\\/' + pattern + '\\/vpre\\/(.*)\\.(svg|png|gif|jpg|json)$');
  var dtRegex = new RegExp('^\\/' + pattern + '\\/dt\\/(.*)\\.(svg|png|gif|jpg|json)$');

  function getNugetPackage(apiUrl, id, includePre, request, done) {
    var filter = includePre ?
      'Id eq \'' + id + '\' and IsAbsoluteLatestVersion eq true' :
      'Id eq \'' + id + '\' and IsLatestVersion eq true';
    var reqUrl = apiUrl + '/Packages()?$filter=' + encodeURIComponent(filter);
    request(reqUrl,
    { headers: { 'Accept': 'application/atom+json,application/json' } },
    function(err, res, buffer) {
      if (err != null) {
        done(err);
        return;
      }

      try {
        var data = JSON.parse(buffer);
        var result = data.d.results[0];
        if (result == null) {
          if (includePre === null) {
            getNugetPackage(apiUrl, id, true, request, done);
          } else {
            done(new Error('Package not found in feed'));
          }
        } else {
          done(null, result);
        }
      }
      catch (e) {
        done(e);
      }
    });
  }

  camp.route(vRegex,
  cache(function(data, match, sendBadge, request) {
    var info = getInfo(match);
    var site = info.site;  // eg, `Chocolatey`, or `YoloDev`
    var repo = match[offset + 1];  // eg, `Nuget.Core`.
    var format = match[offset + 2];
    var apiUrl = info.feed;
    var badgeData = getBadgeData(site, data);
    getNugetPackage(apiUrl, repo, null, request, function(err, data) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      try {
        var version = data.NormalizedVersion || data.Version;
        badgeData.text[1] = 'v' + version;
        if (version.indexOf('-') !== -1) {
          badgeData.colorscheme = 'yellow';
        } else if (version[0] === '0') {
          badgeData.colorscheme = 'orange';
        } else {
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  }));

  camp.route(vPreRegex,
  cache(function(data, match, sendBadge, request) {
    var info = getInfo(match);
    var site = info.site;  // eg, `Chocolatey`, or `YoloDev`
    var repo = match[offset + 1];  // eg, `Nuget.Core`.
    var format = match[offset + 2];
    var apiUrl = info.feed;
    var badgeData = getBadgeData(site, data);
    getNugetPackage(apiUrl, repo, true, request, function(err, data) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      try {
        var version = data.NormalizedVersion || data.Version;
        badgeData.text[1] = 'v' + version;
        if (version.indexOf('-') !== -1) {
          badgeData.colorscheme = 'yellow';
        } else if (version[0] === '0') {
          badgeData.colorscheme = 'orange';
        } else {
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  }));

  camp.route(dtRegex,
  cache(function(data, match, sendBadge, request) {
    var info = getInfo(match);
    var site = info.site;  // eg, `Chocolatey`, or `YoloDev`
    var repo = match[offset+ 1];  // eg, `Nuget.Core`.
    var format = match[offset + 2];
    var apiUrl = info.feed;
    var badgeData = getBadgeData(site, data);
    getNugetPackage(apiUrl, repo, null, request, function(err, data) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      try {
        var downloads = data.DownloadCount;
        badgeData.text[1] = metric(downloads);
        badgeData.colorscheme = downloadCountColor(downloads);
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  }));
}

function mapNugetFeed(pattern, offset, getInfo) {
  var vRegex = new RegExp('^\\/' + pattern + '\\/v\\/(.*)\\.(svg|png|gif|jpg|json)$');
  var vPreRegex = new RegExp('^\\/' + pattern + '\\/vpre\\/(.*)\\.(svg|png|gif|jpg|json)$');
  var dtRegex = new RegExp('^\\/' + pattern + '\\/dt\\/(.*)\\.(svg|png|gif|jpg|json)$');

  function getNugetData(apiUrl, id, request, done) {
    // get service index document
    regularUpdate(apiUrl + '/index.json',
      // The endpoint changes once per year (ie, a period of n = 1 year).
      // We minimize the users' waiting time for information.
      // With l = latency to fetch the endpoint and x = endpoint update period
      // both in years, the yearly number of queries for the endpoint are 1/x,
      // and when the endpoint changes, we wait for up to x years to get the
      // right endpoint.
      // So the waiting time within n years is n*l/x + x years, for which a
      // derivation yields an optimum at x = sqrt(n*l), roughly 42 minutes.
      (42 * 60 * 1000),
      function(buffer) {
        var data = JSON.parse(buffer);

        var searchQueryResources = data.resources.filter(function(resource) {
          return resource['@type'] === 'SearchQueryService';
        });

        return searchQueryResources;
      },
      function(err, searchQueryResources) {
        if (err != null) { done(err); return; }

        // query autocomplete service
        var randomEndpointIdx = Math.floor(Math.random() * searchQueryResources.length);
        var reqUrl = searchQueryResources[randomEndpointIdx]['@id']
          + '?q=packageid:' + encodeURIComponent(id.toLowerCase()) // NuGet package id (lowercase)
          + '&prerelease=true';                                    // Include prerelease versions?

        request(reqUrl, function(err, res, buffer) {
          if (err != null) {
            done(err);
            return;
          }

          try {
            var data = JSON.parse(buffer);
            if (!Array.isArray(data.data) || data.data.length !== 1) {
              done(new Error('Package not found in feed'));
              return;
            }
            done(null, data.data[0]);
          } catch (e) { done(e); }
        });
      });
  }

  function getNugetVersion(apiUrl, id, includePre, request, done) {
    getNugetData(apiUrl, id, request, function(err, data) {
      if (err) {
        done(err);
        return;
      }
      var versions = data.versions || [];
      if (!includePre) {
        // Remove prerelease versions.
        var filteredVersions = versions.filter(function(version) {
          return !/-/.test(version.version);
        });
        if (filteredVersions.length > 0) {
          versions = filteredVersions;
        }
      }
      var lastVersion = versions[versions.length - 1];
      done(null, lastVersion.version);
    });
  }

  camp.route(vRegex,
  cache(function(data, match, sendBadge, request) {
    var info = getInfo(match);
    var site = info.site;  // eg, `Chocolatey`, or `YoloDev`
    var repo = match[offset + 1];  // eg, `Nuget.Core`.
    var format = match[offset + 2];
    var apiUrl = info.feed;
    var badgeData = getBadgeData(site, data);
    getNugetVersion(apiUrl, repo, false, request, function(err, version) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      try {
        badgeData.text[1] = 'v' + version;
        if (version.indexOf('-') !== -1) {
          badgeData.colorscheme = 'yellow';
        } else if (version[0] === '0') {
          badgeData.colorscheme = 'orange';
        } else {
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  }));

  camp.route(vPreRegex,
  cache(function(data, match, sendBadge, request) {
    var info = getInfo(match);
    var site = info.site;  // eg, `Chocolatey`, or `YoloDev`
    var repo = match[offset + 1];  // eg, `Nuget.Core`.
    var format = match[offset + 2];
    var apiUrl = info.feed;
    var badgeData = getBadgeData(site, data);
    getNugetVersion(apiUrl, repo, true, request, function(err, version) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      try {
        badgeData.text[1] = 'v' + version;
        if (version.indexOf('-') !== -1) {
          badgeData.colorscheme = 'yellow';
        } else if (version[0] === '0') {
          badgeData.colorscheme = 'orange';
        } else {
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  }));


  camp.route(dtRegex,
  cache(function(data, match, sendBadge, request) {
    var info = getInfo(match);
    var repo = match[offset + 1];  // eg, `Nuget.Core`.
    var format = match[offset + 2];
    var apiUrl = info.feed;
    var badgeData = getBadgeData('downloads', data);
    getNugetData(apiUrl, repo, request, function(err, nugetData) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      try {
        // Official NuGet server uses "totalDownloads" whereas MyGet uses
        // "totaldownloads" (lowercase D). Ugh.
        var downloads = nugetData.totalDownloads || nugetData.totaldownloads || 0;
        badgeData.text[1] = metric(downloads);
        badgeData.colorscheme = downloadCountColor(downloads);
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  }));
}

// Chocolatey
mapNugetFeedv2('chocolatey', 0, function(match) {
  return {
    site: 'chocolatey',
    feed: 'https://www.chocolatey.org/api/v2'
  };
});

// NuGet
mapNugetFeed('nuget', 0, function(match) {
  return {
    site: 'nuget',
    feed: 'https://api.nuget.org/v3'
  };
});

// MyGet
mapNugetFeed('(.+\\.)?myget\\/(.*)', 2, function(match) {
  var tenant = match[1] || 'www.';  // eg. dotnet
  var feed = match[2];
  return {
    site: feed,
    feed: 'https://' + tenant + 'myget.org/F/' + feed + '/api/v3'
  };
});

// Puppet Forge modules
camp.route(/^\/puppetforge\/([^\/]+)\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // either `v`, `dt`, `e` or `f`
  var user = match[2];
  var module = match[3];
  var format = match[4];
  var options = {
    json: true,
    uri: 'https://forgeapi.puppetlabs.com/v3/modules/' + user + '-' + module
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
          var vdata = versionColor(json.current_release.version);
          badgeData.text[1] = vdata.version;
          badgeData.colorscheme = vdata.color;
        } else {
          badgeData.text[1] = 'none';
          badgeData.colorscheme = 'lightgrey';
        }
      } else if (info === 'dt') {
        var total = json.downloads;
        badgeData.colorscheme = downloadCountColor(total);
        badgeData.text[0] = 'downloads';
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
        badgeData.text[0] = 'endorsement';
        if (endorsement != null) {
          badgeData.text[1] = endorsement;
        } else {
          badgeData.text[1] = 'none';
        }
      } else if (info === 'f') {
        var feedback = json.feedback_score;
        badgeData.text[0] = 'score';
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
camp.route(/^\/puppetforge\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // either `rc` or `mc`
  var user = match[2];
  var format = match[3];
  var options = {
    json: true,
    uri: 'https://forgeapi.puppetlabs.com/v3/users/' + user
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
        badgeData.text[0] = 'releases';
        badgeData.text[1] = metric(releases);
      } else if (info === 'mc') {
        var modules = json.module_count;
        badgeData.colorscheme = floorCountColor(modules, 5, 10, 50);
        badgeData.text[0] = 'modules';
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
camp.route(/^\/jenkins(?:-ci)?\/s\/(http(?:s)?)\/([^\/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[1];  // http(s)
  var host = match[2];  // example.org:8080
  var job = match[3];  // folder/job
  var format = match[4];
  var options = {
    json: true,
    uri: scheme + '://' + host + '/job/' + job + '/api/json?tree=color'
  };
  if (job.indexOf('/') > -1 ) {
    options.uri = scheme + '://' + host + '/' + job + '/api/json?tree=color';
  }

  if (serverSecrets && serverSecrets.jenkins_user) {
    options.auth = {
      user: serverSecrets.jenkins_user,
      pass: serverSecrets.jenkins_pass
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
camp.route(/^\/jenkins(?:-ci)?\/t\/(http(?:s)?)\/([^\/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[1];  // http(s)
  var host = match[2];  // example.org:8080
  var job = match[3];  // folder/job
  var format = match[4];
  var options = {
    json: true,
    uri: scheme + '://' + host + '/job/' + job
      + '/lastBuild/api/json?tree=actions[failCount,skipCount,totalCount]'
  };
  if (job.indexOf('/') > -1 ) {
    options.uri = scheme + '://' + host + '/' + job
      + '/lastBuild/api/json?tree=actions[failCount,skipCount,totalCount]';
  }

  if (serverSecrets && serverSecrets.jenkins_user) {
    options.auth = {
      user: serverSecrets.jenkins_user,
      pass: serverSecrets.jenkins_pass
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

// Jenkins coverage integration
camp.route(/^\/jenkins(?:-ci)?\/c\/(http(?:s)?)\/([^\/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[1];  // http(s)
  var host = match[2];  // example.org:8080
  var job = match[3];  // folder/job
  var format = match[4];
  var options = {
    json: true,
    uri: scheme + '://' + host + '/job/' + job
      + '/lastBuild/cobertura/api/json?tree=results[elements[name,denominator,numerator,ratio]]'
  };
  if (job.indexOf('/') > -1 ) {
    options.uri = scheme + '://' + host + '/' + job
      + '/lastBuild/cobertura/api/json?tree=results[elements[name,denominator,numerator,ratio]]';
  }

  if (serverSecrets && serverSecrets.jenkins_user) {
    options.auth = {
      user: serverSecrets.jenkins_user,
      pass: serverSecrets.jenkins_pass
    };
  }

  var badgeData = getBadgeData('coverage', data);
  request(options, function(err, res, json) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    try {
      var coverageObject = json.results.elements.filter(function (obj) {
        return obj.name === 'Lines';
      })[0];
      if (coverageObject === undefined) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      var coverage = coverageObject.ratio;
      if (+coverage !== +coverage) {
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

// Ansible integration
camp.route(/^\/ansible\/(role)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];      // eg role
  var roleId = match[2];    // eg 3078
  var format = match[3];
  var options = {
    json: true,
    uri: 'https://galaxy.ansible.com/api/v1/roles/' + roleId + '/',
  };
  var badgeData = getBadgeData(type, data);
  request(options, function(err, res, json) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (type === 'role') {
        badgeData.text[1] = json.namespace + '.' + json.name;
        badgeData.colorscheme = 'blue';
      } else {
        badgeData.text[1] = 'unknown';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'errored';
      sendBadge(format, badgeData);
    }
  });
}));
// Codeship.io integration
camp.route(/^\/codeship\/([^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectId = match[1];  // eg, `ab123456-00c0-0123-42de-6f98765g4h32`.
  var format = match[3];
  var branch = match[2];
  var options = {
    method: 'GET',
    uri: 'https://codeship.com/projects/' + projectId + '/status' + (branch != null ? '?branch=' + branch : '')
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
                           .match(/filename="status_(.+)\.png"/);
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
          badgeData.text[1] = 'pending';
          break;
        case 'error':
          badgeData.text[1] = 'failing';
          badgeData.colorscheme = 'red';
          break;
        case 'stopped':
          badgeData.text[1] = 'not built';
          break;
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
    }
  });
}));

// Magnum CI integration
camp.route(/^\/magnumci\/ci\/([^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectId = match[1]; // E.g. 96ffb83fa700f069024921b0702e76ff
  var branch = match[2];    // E.g. master
  var format = match[3];
  var options = {
    method: 'GET',
    uri: 'https://magnum-ci.com/status/' + projectId + '.png'
  };
  if (branch != null) {
    options.uri += '?branch=' + branch;
  }
  var badgeData = getBadgeData('build', data);
  request(options, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var statusMatch = res.headers['content-disposition']
                           .match(/filename="(.+)\.png"/);
      if (!statusMatch) {
        badgeData.text[1] = 'unknown';
        sendBadge(format, badgeData);
        return;
      }

      switch (statusMatch[1]) {
        case 'pass':
          badgeData.text[1] = 'passing';
          badgeData.colorscheme = 'brightgreen';
          break;
        case 'fail':
          badgeData.text[1] = 'failing';
          badgeData.colorscheme = 'red';
          break;
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'not found';
      sendBadge(format, badgeData);
    }
  });
}));

// Maven-Central artifact version integration
// API documentation: http://search.maven.org/#api
camp.route(/^\/maven-central\/v\/(.*)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var groupId = match[1]; // eg, `com.google.inject`
  var artifactId = match[2]; // eg, `guice`
  var format = match[3] || "gif"; // eg, `guice`
  var query = "g:" + encodeURIComponent(groupId) + "+AND+a:" + encodeURIComponent(artifactId);
  var apiUrl = 'https://search.maven.org/solrsearch/select?rows=1&q='+query;
  var badgeData = getBadgeData('maven-central', data);
  request(apiUrl, { headers: { 'Accept': 'application/json' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var version = data.response.docs[0].latestVersion;
      badgeData.text[1] = 'v' + version;
      if (version === '0' || /SNAPSHOT/.test(version)) {
        badgeData.colorscheme = 'orange';
      } else {
        badgeData.colorscheme = 'blue';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Bower version integration.
camp.route(/^\/bower\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, `bootstrap`.
  var format = match[2];
  var badgeData = getBadgeData('bower', data);
  var bower = require('bower');
  bower.commands.info(repo, 'version')
    .on('error', function() {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    })
    .on('end', function(version) {
      try {
        var vdata = versionColor(version);
        badgeData.text[1] = vdata.version;
        badgeData.colorscheme = vdata.color;
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'void';
        sendBadge(format, badgeData);
      }
    });
}));

// Bower license integration.
camp.route(/^\/bower\/l\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, `bootstrap`.
  var format = match[2];
  var badgeData = getBadgeData('bower', data);
  var bower = require('bower');
  bower.commands.info(repo, 'license')
    .on('error', function() {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    })
    .on('end', function(license) {
      try {
        badgeData.text[1] = license;
        badgeData.colorscheme = 'blue';
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'void';
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
    uri: 'http://wheelmap.org/nodes/' + nodeId + '.json'
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
      badgeData.text[1] = 'v' + version;
      if (version[0] === '0') {
        badgeData.colorscheme = 'orange';
      } else {
        badgeData.colorscheme = 'blue';
      }
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
      var rating = JSON.parse(buffer).rating;
      rating = (rating/100)*5;
      badgeData.text[1] = metric(Math.round(rating * 10) / 10) + ' stars';
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

// SourceForge integration.
camp.route(/^\/sourceforge\/([^\/]+)\/([^/]*)\/?(.*).(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];      // eg, 'dm'
  var project = match[2];   // eg, 'sevenzip`.
  var folder = match[3];
  var format = match[4];
  var apiUrl = 'http://sourceforge.net/projects/' + project + '/files/' + folder + '/stats/json';
  var badgeData = getBadgeData('sourceforge', data);
  var time_period, start_date, end_date;
  if (info.charAt(0) === 'd') {
    badgeData.text[0] = getLabel('downloads', data);
    // get yesterday since today is incomplete
    end_date = new Date((new Date()).getTime() - 1000*60*60*24);
    switch (info.charAt(1)) {
      case 'm':
        start_date = new Date(end_date.getTime() - 1000*60*60*24*30);
        time_period = '/month';
        break;
      case 'w':
        start_date = new Date(end_date.getTime() - 1000*60*60*24*6);  // 6, since date range is inclusive
        time_period = '/week';
        break;
      case 'd':
        start_date = end_date;
        time_period = '/day';
        break;
      case 't':
        start_date = new Date(99, 0, 1);
        time_period = '/total';
        break;
    }
  }
  apiUrl += '?start_date=' + start_date.toISOString().slice(0,10) + '&end_date=' + end_date.toISOString().slice(0,10);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var downloads = data.total;
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
camp.route(/^\/requires\/([^\/]+\/[^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
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
    json: true,
    uri: uri
  };
  var badgeData = getBadgeData('requirements', data);
  request(options, function(err, res, json) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      badgeData.colorscheme = 'red';
      sendBadge(format, badgeData);
      return;
    }
    try {
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
      badgeData.text[1] = 'invalid' + e.toString();
      sendBadge(format, badgeData);
      return;
    }
  });
}));

// apm download integration.
camp.route(/^\/apm\/dm\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, `vim-mode`.
  var format = match[2];
  var apiUrl = 'https://atom.io/api/packages/' + repo;
  var badgeData = getBadgeData('downloads', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var dls = JSON.parse(buffer).downloads;
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    badgeData.text[1] = metric(dls);
    badgeData.colorscheme = 'green';
    sendBadge(format, badgeData);
  });
}));

// apm version integration.
camp.route(/^\/apm\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, `vim-mode`.
  var format = match[2];
  var apiUrl = 'https://atom.io/api/packages/' + repo;
  var badgeData = getBadgeData('apm', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var releases = JSON.parse(buffer).releases;
      var version = releases.latest;
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    badgeData.text[1] = 'v' + version;
    badgeData.colorscheme = 'green';
    sendBadge(format, badgeData);
  });
}));

// apm license integration.
camp.route(/^\/apm\/l\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, `vim-mode`.
  var format = match[2];
  var apiUrl = 'https://atom.io/api/packages/' + repo;
  var badgeData = getBadgeData('license', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var metadata = JSON.parse(buffer).metadata;
      var license = metadata.license;
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    badgeData.text[1] = license;
    badgeData.colorscheme = 'blue';
    sendBadge(format, badgeData);
  });
}));

// CircleCI build integration.
// https://circleci.com/api/v1/project/BrightFlair/PHP.Gt?circle-token=0a5143728784b263d9f0238b8d595522689b3af2&limit=1&filter=completed
camp.route(/^\/circleci\/(?:token\/(\w+))?[+\/]?project\/(?:(github|bitbucket)\/)?([^\/]+\/[^\/]+)(?:\/(.*))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var token = match[1];
  var type = match[2] || 'github'; // github OR bitbucket
  var userRepo = match[3];  // eg, `RedSparr0w/node-csgo-parser`.
  var branch = match[4];
  var format = match[5];

  // Base API URL
  var apiUrl = 'https://circleci.com/api/v1.1/project/' + type + '/' + userRepo;

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
  apiUrl += '?' + querystring.stringify(queryParams);

  var badgeData = getBadgeData('build', data);
  request(apiUrl, {json:true}, function(err, res, data) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    if (data.message !== undefined){
      badgeData.text[1] = data.message;
      sendBadge(format, badgeData);
      return;
    }
    try {
      var status = data[0].status;
      switch(status) {
      case 'success':
      case 'fixed':
        badgeData.colorscheme = 'brightgreen';
        badgeData.text[1] = 'passing';
        break;

      case 'failed':
        badgeData.colorscheme = 'red';
        badgeData.text[1] = 'failed';
        break;

      case 'no_tests':
      case 'scheduled':
      case 'not_run':
        badgeData.colorscheme = 'yellow';
        badgeData.text[1] = status.replace('_', ' ');
        break;

      default:
        badgeData.text[1] = status.replace('_', ' ');
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// CPAN integration.
camp.route(/^\/cpan\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // either `v` or `l`
  var pkg = match[2]; // eg, Config-Augeas
  var format = match[3];
  var badgeData = getBadgeData('cpan', data);
  var url = 'https://api.metacpan.org/v0/release/'+pkg;
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
        var vdata = versionColor(version);
        badgeData.text[1] = vdata.version;
        badgeData.colorscheme = vdata.color;
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
camp.route(/^\/cran\/([vl])\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // either `v` or `l`
  var pkg = match[2]; // eg, devtools
  var format = match[3];
  var url = 'http://crandb.r-pkg.org/' + pkg;
  var badgeData = getBadgeData('cran', data);
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
        var vdata = versionColor(version);
        badgeData.text[1] = vdata.version;
        badgeData.colorscheme = vdata.color;
        sendBadge(format, badgeData);
      } else if (info === 'l') {
        badgeData.text[0] = 'license';
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
camp.route(/^\/ctan\/([vl])\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
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
      var data = JSON.parse(buffer);

      if (info === 'v') {
        var version = data.version.number;
        var vdata = versionColor(version);
        badgeData.text[1] = vdata.version;
        badgeData.colorscheme = vdata.color;
        sendBadge(format, badgeData);
      } else if (info === 'l') {
        badgeData.text[0] = 'license';
        var license = data.license;
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
camp.route(/^\/dub\/(dd|dw|dm|dt)\/([^\/]+)(?:\/([^\/]+))?\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var info = match[1]; // downloads (dd - daily, dw - weekly, dm - monthly, dt - total)
  var pkg = match[2]; // package name, e.g. vibe-d
  var version = match[3]; // version (1.2.3 or latest)
  var format = match[4];
  var apiUrl = 'http://code.dlang.org/api/packages/'+pkg;
  if (version) {
    apiUrl += '/' + version;
  }
  apiUrl += '/stats';
  var badgeData = getBadgeData('dub', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (info.charAt(0) === 'd') {
        badgeData.text[0] = getLabel('downloads', data);
        var downloads;
        switch (info.charAt(1)) {
          case 'm':
            downloads = data.downloads.monthly;
            badgeData.text[1] = metric(downloads) + '/month';
            break;
          case 'w':
            downloads = data.downloads.weekly;
            badgeData.text[1] = metric(downloads) + '/week';
            break;
          case 'd':
            downloads = data.downloads.daily;
            badgeData.text[1] = metric(downloads) + '/day';
            break;
          case 't':
            downloads = data.downloads.total;
            badgeData.text[1] = metric(downloads);
            break;
        }
        if (version) {
            badgeData.text[1] += ' ' + versionColor(version).version;
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
camp.route(/^\/dub\/(v|l)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function (data, match, sendBadge, request) {
  var info = match[1];  // (v - version, l - license)
  var pkg = match[2];  // package name, e.g. vibe-d
  var format = match[3];
  var apiUrl = 'http://code.dlang.org/api/packages/' + pkg;
  if (info === 'v') {
    apiUrl += '/latest';
  } else if (info === 'l') {
    apiUrl += '/latest/info';
  }
  var badgeData = getBadgeData('dub', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (info === 'v') {
        var vdata = versionColor(data);
        badgeData.text[1] = vdata.version;
        badgeData.colorscheme = vdata.color;
        sendBadge(format, badgeData);
      } else if (info == 'l') {
        var license = data.info.license;
        badgeData.text[0] = 'license';
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
camp.route(/^\/docker\/stars\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
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
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var stars = +("" + buffer);
      badgeData.text[1] = metric(stars);
      badgeData.colorscheme = null;
      badgeData.colorB = '#008bb8';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Docker Hub pulls integration.
camp.route(/^\/docker\/pulls\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
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
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var pulls = data.pull_count;
      badgeData.text[1] = metric(pulls);
      badgeData.colorscheme = null;
      badgeData.colorB = '#008bb8';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));


// Docker Hub automated integration.
camp.route(/^\/docker\/automated\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
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
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      var is_automated = data.is_automated;
      if (is_automated) {
        badgeData.text[1] = 'automated';
        badgeData.colorscheme = 'blue';
      } else {
        badgeData.text[1] = 'manual';
        badgeData.colorscheme = 'yellow';
      }
      badgeData.colorB = '#008bb8';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Docker Hub automated integration, most recent build's status (passed, pending, failed)
camp.route(/^\/docker\/build\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
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
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (res.statusCode == 404) {
        badgeData.text[1] = 'repo not found';
        sendBadge(format, badgeData);
        return;
      }
      var data = JSON.parse(buffer);
      var most_recent_status = data.results[0].status;
      if (most_recent_status == 10) {
        badgeData.text[1] = 'passing';
        badgeData.colorscheme = 'brightgreen';
      } else if (most_recent_status < 0) {
        badgeData.text[1] = 'failing';
        badgeData.colorscheme = 'red';
      } else {
        badgeData.text[1] = 'building';
        badgeData.colorB = '#008bb8';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Twitter integration.
camp.route(/^\/twitter\/url\/([^\/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[1]; // eg, https
  var path = match[2];   // eg, shields.io
  var format = match[3];
  var page = encodeURIComponent(scheme + '://' + path);
  // The URL API died: #568.
  //var url = 'http://cdn.api.twitter.com/1/urls/count.json?url=' + page;
  var badgeData = getBadgeData('tweet', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.twitter;
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
camp.route(/^\/twitter\/follow\/@?([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1]; // eg, shields_io
  var format = match[2];
  var options = {
    url: 'http://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=' + user
  };
  var badgeData = getBadgeData('Follow @' + user, data);

  badgeData.colorscheme = null;
  badgeData.colorB = '#55ACEE';
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.twitter;
  }
  badgeData.links = [
    'https://twitter.com/intent/follow?screen_name=' + user,
    'https://twitter.com/' + user + '/followers'
  ];
  badgeData.text[1] = '';
  request(options, function(err, res, buffer) {
    if (err != null) {
      sendBadge(format, badgeData);
      return;
    }
    try {
      // The data is formatted as an array.
      var data = JSON.parse(buffer)[0];
      // data.followers_count could be zero… don't just check if falsey.
      if (data !== undefined && data.followers_count != null){
        badgeData.text[1] = metric(data.followers_count);
      }
    } catch(e) {
      console.error(e);
    }
    sendBadge(format, badgeData);
  });
}));

// Snap CI build integration.
// https://snap-ci.com/snap-ci/snap-deploy/branch/master/build_image
camp.route(/^\/snap(-ci?)\/([^\/]+\/[^\/]+)(?:\/(.+))\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[2];
  var branch = match[3];
  var format = match[4];
  var url = 'https://snap-ci.com/' + userRepo + '/branch/' + branch + '/build_image.svg';

  var badgeData = getBadgeData('build', data);
  fetchFromSvg(request, url, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      badgeData.text[1] = res.toLowerCase();
      if (res === 'Passed') {
        badgeData.colorscheme = 'brightgreen';
        badgeData.text[1] = 'passing';
      } else if (res === 'Failed') {
        badgeData.colorscheme = 'red';
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Visual Studio Team Services build integration.
camp.route(/^\/vso\/build\/([^\/]+)\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
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
camp.route(/^\/imagelayers\/(image\-size|layers)\/([^\/]+)\/([^\/]+)\/([^\/]*)\.(svg|png|gif|jpg|json)$/,
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
      "repos": [{"name": path, "tag": tag}]
    },
    uri: 'https://imagelayers.io/registry/analyze'
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
        badgeData.text[0] = 'image size';
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

// Gitter room integration.
camp.route(/^\/gitter\/room\/([^\/]+\/[^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  // match[1] is the repo, which is not used.
  var format = match[2];

  var badgeData = getBadgeData('chat', data);
  badgeData.text[1] = 'on gitter';
  badgeData.colorscheme = 'brightgreen';
  if (darkBackgroundTemplates.some(function(t) { return t === badgeData.template; })) {
    badgeData.logo = badgeData.logo || logos['gitter-white'];
    badgeData.logoWidth = 9;
  }
  sendBadge(format, badgeData);
}));

// homebrew integration
camp.route(/^\/homebrew\/v\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var pkg = match[1];  // eg. cake
  var format = match[2];
  var apiUrl = 'http://braumeister.org/formula/' + pkg + '/version';

  var badgeData = getBadgeData('homebrew', data);
  request(apiUrl, { headers: { 'Accept': 'application/json' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      var data = JSON.parse(buffer);
      var version = data.stable;

      var vdata = versionColor(version);
      badgeData.text[1] = vdata.version;
      badgeData.colorscheme = vdata.color;

      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// StackExchange integration.
camp.route(/^\/stackexchange\/([^\/]+)\/([^\/])\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
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
    gzip: true
  };
  var badgeData = getBadgeData(site, data);
  request(options, function (err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer.toString());

      // IP rate limiting
      if (data.error_name === 'throttle_violation') {
        return;  // Hope for the best in the cache.
      }

      if (info === 'r') {
        var reputation = data.items[0].reputation;
        badgeData.text[0] = site + ' reputation';
        badgeData.text[1] = metric(reputation);
        badgeData.colorscheme = floorCountColor(1000, 10000, 20000);
      } else if (info === 't') {
        var count = data.items[0].count;
        badgeData.text[0] = site + ' ' + item + ' questions';
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
camp.route(/^\/maintenance\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var status = match[1];  // eg, yes
  var year = +match[2];  // eg, 2016
  var format = match[3];
  var badgeData = getBadgeData('maintained', data);
  try {
    var now = new Date();
    var cy = now.getUTCFullYear();  // current year.
    var m = now.getUTCMonth();  // month.
    if (cy <= year) {
      badgeData.text[1] = status;
      badgeData.colorscheme = 'brightgreen';
    } else if ((cy === year + 1) && (m < 3)) {
      badgeData.text[1] = 'stale (as of ' + cy + ')';
    } else {
      badgeData.text[1] = 'no!';
      badgeData.colorscheme = 'red';
    }
    sendBadge(format, badgeData);
  } catch(e) {
    console.error(e.stack);
    badgeData.text[1] = 'invalid';
    sendBadge(format, badgeData);
  }
}));

// bitHound integration
camp.route(/^\/bithound\/(code\/|dependencies\/|devDependencies\/)?(.+?)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1].slice(0, -1);
  var userRepo = match[2];  // eg, `github/rexxars/sse-channel`.
  var format = match[3];
  var apiUrl = 'https://www.bithound.io/api/' + userRepo + '/badge/' + type;
  var badgeData = getBadgeData(type === 'devDependencies' ? 'dev dependencies' : type, data);

  request(apiUrl, { headers: { 'Accept': 'application/json' } }, function(err, res, buffer) {
    try {
      var data = JSON.parse(buffer);
      badgeData.text[1] = data.label;
      badgeData.logo = logos['bithound'];
      badgeData.logoWidth = 15;
      badgeData.colorscheme = null;
      badgeData.colorB = '#' + data.color;
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Waffle.io integration
camp.route(/^\/waffle\/label\/([^\/]+)\/([^\/]+)\/?([^\/]+)?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, evancohen
  var repo = match[2];  // eg, smart-mirror
  var ghLabel = match[3] || 'ready';  // eg, in%20progress
  var format = match[4];
  var apiUrl = 'https://api.waffle.io/' + user + '/' + repo + '/cards';
  var badgeData = getBadgeData('issues', data);

  request(apiUrl, function(err, res, buffer) {
    try {
      var cards = JSON.parse(buffer);
      if (cards.length === 0) {
        badgeData.text[1] = 'absent';
        sendBadge(format, badgeData);
        return;
      }
      var count = 0;
      var color;
      for (var i = 0; i < cards.length; i++) {
        var cardMetadata = cards[i].githubMetadata;
        if (cardMetadata.labels && cardMetadata.labels.length > 0) {
          for (var j = 0; j < cardMetadata.labels.length; j++) {
            var label = cardMetadata.labels[j];
            if (label.name === ghLabel) {
              count++;
              color = label.color;
            }
          }
        }
      }
      badgeData.text[0] = data.label || ghLabel;
      badgeData.text[1] = '' + count;
      badgeData.colorscheme = null;
      badgeData.colorB = '#' + (color || '78bdf2');
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
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer).results;
      if (info === 'version') {
        var vdata = versionColor(data.Version);
        badgeData.text[1] = vdata.version;
        if (data.OutOfDate === null) {
          badgeData.colorscheme = 'blue';
        } else {
          badgeData.colorscheme = 'orange';
        }
      } else if (info === 'votes') {
        var votes = data.NumVotes;
        badgeData.text[0] = "votes";
        badgeData.text[1] = votes;
        badgeData.colorscheme = floorCountColor(votes, 2, 20, 60);
      } else if (info === 'license') {
        var license = data.License;
        badgeData.text[0] = "license";
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
camp.route(/^\/chrome-web-store\/(v|d|price|rating|stars|rating-count)\/(.*)\.(svg|png|gif|jpg|json)$/,
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
        if (type === 'v') {
          var vdata = versionColor(value.version);
          badgeData.text[1] = vdata.version;
          badgeData.colorscheme = vdata.color;
        } else if (type === 'd') {
          var downloads = value.interactionCount.UserDownloads;
          badgeData.text[0] = data.label || 'downloads';
          badgeData.text[1] = metric(downloads) + ' total';
          badgeData.colorscheme = downloadCountColor(downloads);
        } else if (type === 'price') {
          badgeData.text[0] = data.label || 'price';
          badgeData.text[1] = currencyFromCode(value.priceCurrency) +
            value.price;
          badgeData.colorscheme = 'brightgreen';
        } else if (type === 'rating') {
          let rating = Math.round(value.ratingValue * 100) / 100;
          badgeData.text[0] = data.label || 'rating';
          badgeData.text[1] = rating + '/5';
          badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);
        } else if (type === 'stars') {
          let rating = Math.round(value.ratingValue);
          badgeData.text[0] = data.label || 'rating';
          badgeData.text[1] = starRating(rating);
          badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);
        } else if (type === 'rating-count') {
          var ratingCount = value.ratingCount;
          badgeData.text[0] = data.label || 'rating count';
          badgeData.text[1] = metric(ratingCount) + ' total';
          badgeData.colorscheme = floorCountColor(ratingCount, 5, 50, 500);
        }
        sendBadge(format, badgeData);
      }).catch(function (err) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      });
  });
}));

// Cauditor integration
camp.route(/^\/cauditor\/(mi|ccn|npath|hi|i|ca|ce|dit)\/([^\/]+)\/([^\/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var labels = {
    'mi': 'maintainability',
    'ccn': 'cyclomatic complexity',
    'npath': 'npath complexity',
    'hi': 'intelligent content',
    'i': 'instability',
    'ca': 'afferent coupling',
    'ce': 'efferent coupling',
    'dit': 'depth of inheritance'
  };
  // values for color ranges (left = green, right = red)
  var colors = {
    'mi': [70, 55, 45, 35],
    'ccn': [2, 4, 7, 11],
    'npath': [2, 25, 60, 200],
    'hi': [2, 20, 45, 80],
    'i': [.2, .5, .75, .8],
    'ca': [2, 4, 7, 10],
    'ce': [2, 7, 13, 20],
    'dit': [2, 3, 4, 5]
  };
  var metric = match[1];
  var user = match[2];
  var repo = match[3];
  var branch = match[4];
  var format = match[5];
  var badgeData = getBadgeData(labels[metric], data);
  var url = 'https://www.cauditor.org/api/v1/' + user + '/' + repo + '/' + branch + '/HEAD';
  request(url, function(err, res, buffer) {
    if (err != null || res.statusCode !== 200) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    var data = JSON.parse(buffer);
    var value = data.metrics.weighed[metric];
    var range = colors[metric];

    badgeData.text[1] = Math.round(value);
    if (metric === 'mi') {
      badgeData.text[1] += '%';
    }

    // calculate colors: anything in the given range is green to yellow
    if (value >= Math.min(range[0], range[1]) && value < Math.max(range[0], range[1])) {
      badgeData.colorscheme = 'green';
    } else if (value >= Math.min(range[1], range[2]) && value < Math.max(range[1], range[2])) {
      badgeData.colorscheme = 'yellowgreen';
    } else if (value >= Math.min(range[2], range[3]) && value < Math.max(range[2], range[3])) {
      badgeData.colorscheme = 'yellow';
    // anything higher than (or lower, in case of 'mi') first value is green
    } else if ((value < range[0] && range[0] < range[1]) || (value > range[0] && range[0] > range[1])) {
      badgeData.colorscheme = 'brightgreen';
    // anything not yet matched is bad!
    } else {
      badgeData.colorscheme = 'red';
    }

    sendBadge(format, badgeData);
  });
}));

// Mozilla addons integration
camp.route(/^\/amo\/(v|d|rating|stars|users)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];
  var addonId = match[2];
  var format = match[3];
  var badgeData = getBadgeData('mozilla add-on', data);
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
          var vdata = versionColor(version);
          badgeData.text[1] = vdata.version;
          badgeData.colorscheme = vdata.color;
          break;
        case 'd':
          var downloads = parseInt(data.addon.total_downloads[0], 10);
          badgeData.text[0] = 'downloads';
          badgeData.text[1] = metric(downloads);
          badgeData.colorscheme = downloadCountColor(downloads);
          break;
        case 'rating':
          rating = parseInt(data.addon.rating, 10);
          badgeData.text[0] = 'rating';
          badgeData.text[1] = rating + '/5';
          badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);
          break;
        case 'stars':
          rating = parseInt(data.addon.rating, 10);
          badgeData.text[0] = 'rating';
          badgeData.text[1] = starRating(rating);
          badgeData.colorscheme = floorCountColor(rating, 2, 3, 4);
          break;
        case 'users':
          var dailyUsers = parseInt(data.addon.daily_users[0], 10);
          badgeData.text[0] = 'users';
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
      if (sixHex(offlineColor)) {
        badgeData.colorB = '#' + offlineColor;
      } else {
        badgeData.colorscheme = offlineColor;
      }
      sendBadge(format, badgeData);
      return;
    } else {
      badgeData.text[1] = onlineMessage;
      if (sixHex(onlineColor)) {
        badgeData.colorB = '#' + onlineColor;
      } else {
        badgeData.colorscheme = onlineColor;
      }
      sendBadge(format, badgeData);
      return;
    }
  });
}));

// Issue Stats integration.
camp.route(/^\/issuestats\/([^\/]+)(\/long)?\/([^\/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
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
    p: 'pr'
  };
  var typePropPrefix = typeToPropPrefix[type];
  if (typePropPrefix === undefined) {
    badgeData.text[1] = 'invalid';
    sendBadge(format, badgeData);
    return;
  }

  var url = 'http://issuestats.com/' + host + '/' + userRepo;
  var qs = {format: 'json'};
  if (!longForm) {
    qs.concise = true;
  }
  var options = {
    method: 'GET',
    url: url,
    qs: qs,
    gzip: true,
    json: true
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

      if (label != null) badgeData.text[0] = label;
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
camp.route(/^\/librariesio\/(github|release)\/([\w\-\_]+\/[\w\-\_]+)\/?([\w\-\_\.]+)?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {

  var resource  = match[1];
  var project   = match[2];
  var version   = match[3];
  var format    = match[4];

  var uri;
  switch (resource) {
    case 'github':
      uri = 'https://libraries.io/api/github/' + project + '/dependencies';
      break;
    case 'release':
      var v = version || 'latest';
      uri = 'https://libraries.io/api/' + project + '/' + v + '/dependencies';
      break;
  }

  var options = {method: 'GET', json: true, uri: uri};
  var badgeData = getBadgeData('dependencies', data);

  request(options, function(err, res, json) {

    if (err || res.statusCode !== 200) {
      badgeData.text[1] = 'not available';
      return sendBadge(format, badgeData);
    }

    var deprecated = json.dependencies.filter(function(dep) {
      return dep.deprecated;
    });

    var outofdate = json.dependencies.filter(function(dep) {
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
    json: true
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

// Uptime Robot status integration.
// API documentation : https://uptimerobot.com/api
camp.route(/^\/uptimerobot\/status\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var monitorApiKey = match[1];  // eg, m778918918-3e92c097147760ee39d02d36
  var format = match[2];
  var badgeData = getBadgeData('status', data);
  var options = {
    method: 'POST',
    json: true,
    body: {
      "api_key": monitorApiKey,
      "format": "json"
    },
    uri: 'https://api.uptimerobot.com/v2/getMonitors'
  };
  // A monitor API key must start with "m"
  if (monitorApiKey.substring(0, "m".length) !== "m") {
    badgeData.text[1] = 'must use a monitor key';
    sendBadge(format, badgeData);
    return;
  }
  request(options, function(err, res, json) {
    if (err !== null || res.statusCode >= 500 || typeof json !== 'object') {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (json.stat === 'fail') {
        badgeData.text[1] = 'vendor error';
        if (json.error && typeof json.error.message === 'string') {
          badgeData.text[1] = json.error.message;
        }
        badgeData.colorscheme = 'lightgrey';
        sendBadge(format, badgeData);
        return;
      }
      var status = json.monitors[0].status;
      if (status === 0) {
        badgeData.text[1] = 'paused';
        badgeData.colorscheme = 'yellow';
      } else if (status === 1) {
        badgeData.text[1] = 'not checked yet';
        badgeData.colorscheme = 'yellowgreen';
      } else if (status === 2) {
        badgeData.text[1] = 'up';
        badgeData.colorscheme = 'brightgreen';
      } else if (status === 8) {
        badgeData.text[1] = 'seems down';
        badgeData.colorscheme = 'orange';
      } else if (status === 9) {
        badgeData.text[1] = 'down';
        badgeData.colorscheme = 'red';
      } else {
        badgeData.text[1] = 'invalid';
        badgeData.colorscheme = 'lightgrey';
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Uptime Robot ratio integration.
// API documentation : https://uptimerobot.com/api
camp.route(/^\/uptimerobot\/ratio(\/[^\/]+)?\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var numberOfDays = match[1];  // eg, 7, null if querying 30
  var monitorApiKey = match[2];  // eg, m778918918-3e92c097147760ee39d02d36
  var format = match[3];
  var badgeData = getBadgeData('uptime', data);
  if (numberOfDays) {
    numberOfDays = numberOfDays.slice(1);
  } else {
    numberOfDays = '30';
  }
  var options = {
    method: 'POST',
    json: true,
    body: {
      "api_key": monitorApiKey,
      "custom_uptime_ratios": numberOfDays,
      "format": "json"
    },
    uri: 'https://api.uptimerobot.com/v2/getMonitors'
  };
  // A monitor API key must start with "m"
  if (monitorApiKey.substring(0, "m".length) !== "m") {
    badgeData.text[1] = 'must use a monitor key';
    sendBadge(format, badgeData);
    return;
  }
  request(options, function(err, res, json) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if (json.stat === 'fail') {
        badgeData.text[1] = 'vendor error';
        if (json.error && typeof json.error.message === 'string') {
          badgeData.text[1] = json.error.message;
        }
        badgeData.colorscheme = 'lightgrey';
        sendBadge(format, badgeData);
        return;
      }
      var percent = parseFloat(json.monitors[0].custom_uptime_ratio);
      badgeData.text[1] = percent + '%';
      if (percent <= 10) {
        badgeData.colorscheme = 'red';
      } else if (percent <= 30) {
        badgeData.colorscheme = 'yellow';
      } else if (percent <= 50) {
        badgeData.colorscheme = 'yellowgreen';
      } else if (percent <= 70) {
        badgeData.colorscheme = 'green';
      } else {
        badgeData.colorscheme = 'brightgreen';
      }
      sendBadge(format, badgeData);
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Any badge.
camp.route(/^\/(:|badge\/)(([^-]|--)*?)-(([^-]|--)*)-(([^-]|--)+)\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var subject = escapeFormat(match[2]);
  var status = escapeFormat(match[4]);
  var color = escapeFormat(match[6]);
  var format = match[8];

  incrMonthlyAnalytics(getAnalytics().rawMonthly);
  if (data.style === 'flat') {
    incrMonthlyAnalytics(getAnalytics().rawFlatMonthly);
  } else if (data.style === 'flat-square') {
    incrMonthlyAnalytics(getAnalytics().rawFlatSquareMonthly);
  }

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
    badgeData.colorscheme = undefined;
    if (data.label !== undefined) { badgeData.text[0] = '' + data.label; }
    badgeData.text[1] = status;
    if (badgeData.colorB === undefined) {
      if (sixHex(color)) {
        badgeData.colorB = '#' + color;
      } else if (badgeData.colorA === undefined) {
        badgeData.colorscheme = color;
      }
    }
    if (data.style && validTemplates.indexOf(data.style) > -1) {
      badgeData.template = data.style;
    }
    badge(badgeData, makeSend(format, ask.res, end));
  } catch(e) {
    console.error(e.stack);
    badge({text: ['error', 'bad badge'], colorscheme: 'red'},
      makeSend(format, ask.res, end));
  }
});

// Production cache debugging.
var bitFlip = false;
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
  badge(badgeData, makeSend('svg', ask.res, end));
});

// Any badge, old version.
camp.route(/^\/([^\/]+)\/(.+).png$/,
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
    var badgeData = {text: [subject, status]};
    badgeData.colorscheme = color;
    badge(badgeData, makeSend('png', ask.res, end));
  } catch(e) {
    badge({text: ['error', 'bad badge'], colorscheme: 'red'},
      makeSend('png', ask.res, end));
  }
});

// Redirect the root to the website.
camp.route(/^\/$/, function(data, match, end, ask) {
  ask.res.statusCode = 302;
  ask.res.setHeader('Location', infoSite);
  ask.res.end();
});

// Escapes `t` using the format specified in
// <https://github.com/espadrine/gh-badges/issues/12#issuecomment-31518129>
function escapeFormat(t) {
  return t
    // Inline single underscore.
    .replace(/([^_])_([^_])/g, '$1 $2')
    // Leading or trailing underscore.
    .replace(/([^_])_$/, '$1 ').replace(/^_([^_])/, ' $1')
    // Double underscore and double dash.
    .replace(/__/g, '_').replace(/--/g, '-');
}

function escapeFormatSlashes(t) {
  return escapeFormat(t)
    // Double slash
    .replace(/\/\//g, '/');
}


function sixHex(s) { return /^[0-9a-fA-F]{6}$/.test(s); }

function getLabel(label, data) {
  return data.label || label;
}

function colorParam(color) { return (sixHex(color) ? '#' : '') + color; }

// data (URL query) can include `label`, `style`, `logo`, `logoWidth`, `link`,
// `colorA`, `colorB`.
// It can also include `maxAge`.
function getBadgeData(defaultLabel, data) {
  var label = getLabel(defaultLabel, data);
  var template = data.style || 'default';
  if (data.style && validTemplates.indexOf(data.style) > -1) {
    template = data.style;
  }
  if (!(Object(data.link) instanceof Array)) {
    if (data.link === undefined) {
      data.link = [];
    } else {
      data.link = [data.link];
    }
  }

  if (data.logo !== undefined && !/^data:/.test(data.logo)) {
    data.logo = 'data:' + data.logo;
  }

  if (data.colorA !== undefined) {
    data.colorA = colorParam(data.colorA);
  }
  if (data.colorB !== undefined) {
    data.colorB = colorParam(data.colorB);
  }

  return {
    text: [label, 'n/a'],
    colorscheme: 'lightgrey',
    template: template,
    logo: data.logo,
    logoWidth: +data.logoWidth,
    links: data.link,
    colorA: data.colorA,
    colorB: data.colorB
  };
}

function makeSend(format, askres, end) {
  if (format === 'svg') {
    return function(res) { sendSVG(res, askres, end); };
  } else if (format === 'json') {
    return function(res) { sendJSON(res, askres, end); };
  } else {
    return function(res) { sendOther(format, res, askres, end); };
  }
}

function sendSVG(res, askres, end) {
  askres.setHeader('Content-Type', 'image/svg+xml;charset=utf-8');
  end(null, {template: streamFromString(res)});
}

function sendOther(format, res, askres, end) {
  askres.setHeader('Content-Type', 'image/' + format);
  svg2img(res, format, function (err, data) {
    if (err) {
      // This emits status code 200, though 500 would be preferable.
      console.error('svg2img error', err);
      end(null, {template: '500.html'});
    } else {
      end(null, {template: streamFromString(data)});
    }
  });
}

function sendJSON(res, askres, end) {
  askres.setHeader('Content-Type', 'application/json');
  askres.setHeader('Access-Control-Allow-Origin', '*');
  end(null, {template: streamFromString(res)});
}

var stream = require('stream');
function streamFromString(str) {
  var newStream = new stream.Readable();
  newStream._read = function() { newStream.push(str); newStream.push(null); };
  return newStream;
}

// Map from URL to { timestamp: last fetch time, interval: in milliseconds,
// data: data }.
var regularUpdateCache = Object.create(null);
// url: a string, scraper: a function that takes string data at that URL.
// interval: number in milliseconds.
// cb: a callback function that takes an error and data returned by the scraper.
function regularUpdate(url, interval, scraper, cb) {
  var timestamp = Date.now();
  var cache = regularUpdateCache[url];
  if (cache != null &&
      (timestamp - cache.timestamp) < interval) {
    cb(null, regularUpdateCache[url].data);
    return;
  }
  request(url, function(err, res, buffer) {
    if (err != null) { cb(err); return; }
    if (regularUpdateCache[url] == null) {
      regularUpdateCache[url] = { timestamp: 0, data: 0 };
    }
    try {
      var data = scraper(buffer);
    } catch(e) { cb(e); return; }
    regularUpdateCache[url].timestamp = timestamp;
    regularUpdateCache[url].data = data;
    cb(null, data);
  });
}

// Get data from a svg-style badge.
// cb: function(err, string)
function fetchFromSvg(request, url, cb) {
  request(url, function(err, res, buffer) {
    if (err != null) { return cb(err); }
    try {
      var badge = buffer.replace(/(?:\r\n\s*|\r\s*|\n\s*)/g, '');
      var match = />([^<>]+)<\/text><\/g>/.exec(badge);
      if (!match) { return cb(Error('Cannot fetch from SVG:\n' + buffer)); }
      cb(null, match[1]);
    } catch(e) {
      cb(e);
    }
  });
}

// npm downloads count
function mapNpmDownloads(urlComponent, apiUriComponent) {
  camp.route(new RegExp('^\/npm\/' + urlComponent + '\/(.*)\.(svg|png|gif|jpg|json)$'),
  cache(function(data, match, sendBadge, request) {
    var pkg = encodeURIComponent(match[1]);  // eg, "express" or "@user/express"
    var format = match[2];
    var apiUrl = 'https://api.npmjs.org/downloads/point/' + apiUriComponent + '/' + pkg;
    var badgeData = getBadgeData('downloads', data);
    request(apiUrl, function(err, res, buffer) {
      if (err != null) {
        badgeData.text[1] = 'inaccessible';
        sendBadge(format, badgeData);
        return;
      }
      try {
        var totalDownloads = JSON.parse(buffer).downloads || 0;
        var badgeSuffix = apiUriComponent.replace('last-', '/');
        badgeData.text[1] = metric(totalDownloads) + badgeSuffix;
        if (totalDownloads === 0) {
          badgeData.colorscheme = 'red';
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
}
