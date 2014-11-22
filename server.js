var serverPort = +process.env.PORT || +process.argv[2] || 80;
var infoSite = process.env.INFOSITE || "http://shields.io";
var camp = require('camp').start({
  documentRoot: __dirname,
  port: serverPort
});
console.log('http://127.0.0.1:' + serverPort + '/try.html');
var https = require('https');
var domain = require('domain');
var request = require('request');
var fs = require('fs');
var LruCache = require('./lru-cache.js');
var badge = require('./badge.js');
var svg2img = require('./svg-to-img.js');
var serverSecrets;
try {
  // Everything that cannot be checked in but is useful server-side
  // is stored in this JSON data.
  serverSecrets = require('./secret.json');
} catch(e) { console.error('No secret data (secret.json, see server.js):', e); }
var semver = require('semver');
var serverStartTime = new Date((new Date()).toGMTString());

var validTemplates = ['default', 'flat', 'flat-square'];

// Analytics

var redis;
// Use Redis by default.
var useRedis = true;
if (process.env.REDISTOGO_URL) {
  var redisToGo = require('url').parse(process.env.REDISTOGO_URL);
  redis = require('redis').createClient(redisToGo.port, redisToGo.hostname);
  redis.auth(redisToGo.auth.split(':')[1]);
} else {
  useRedis = false;
}

var analytics = {};

var analyticsAutoSaveFileName = './analytics.json';
var analyticsAutoSavePeriod = 10000;
setInterval(function analyticsAutoSave() {
  if (useRedis) {
    redis.set(analyticsAutoSaveFileName, JSON.stringify(analytics));
  } else {
    fs.writeFileSync(analyticsAutoSaveFileName, JSON.stringify(analytics));
  }
}, analyticsAutoSavePeriod);

function defaultAnalytics() {
  var analytics = Object.create(null);
  // In case something happens on the 36th.
  analytics.vendorMonthly = new Array(36);
  resetMonthlyAnalytics(analytics.vendorMonthly);
  analytics.rawMonthly = new Array(36);
  resetMonthlyAnalytics(analytics.rawMonthly);
  analytics.vendorFlatMonthly = new Array(36);
  resetMonthlyAnalytics(analytics.vendorFlatMonthly);
  analytics.rawFlatMonthly = new Array(36);
  resetMonthlyAnalytics(analytics.rawFlatMonthly);
  analytics.vendorFlatSquareMonthly = new Array(36);
  resetMonthlyAnalytics(analytics.vendorFlatSquareMonthly);
  analytics.rawFlatSquareMonthly = new Array(36);
  resetMonthlyAnalytics(analytics.rawFlatSquareMonthly);
  return analytics;
}

// Auto-load analytics.
function analyticsAutoLoad() {
  var defaultAnalyticsObject = defaultAnalytics();
  if (useRedis) {
    redis.get(analyticsAutoSaveFileName, function(err, value) {
      if (err == null && value != null) {
        // if/try/return trick:
        // if error, then the rest of the function is run.
        try {
          analytics = JSON.parse(value);
          // Extend analytics with a new value.
          for (var key in defaultAnalyticsObject) {
            if (!(key in analytics)) {
              analytics[key] = defaultAnalyticsObject[key];
            }
          }
          return;
        } catch(e) {
          console.error('Invalid Redis analytics, resetting.');
          console.error(e);
        }
      }
      analytics = defaultAnalyticsObject;
    });
  } else {
    // Not using Redis.
    try {
      analytics = JSON.parse(fs.readFileSync(analyticsAutoSaveFileName));
      // Extend analytics with a new value.
      for (var key in defaultAnalyticsObject) {
        if (!(key in analytics)) {
          analytics[key] = defaultAnalyticsObject[key];
        }
      }
    } catch(e) {
      if (e.code !== 'ENOENT') {
        console.error('Invalid JSON file for analytics, resetting.');
        console.error(e);
      }
      analytics = defaultAnalyticsObject;
    }
  }
}

var lastDay = (new Date()).getDate();
function resetMonthlyAnalytics(monthlyAnalytics) {
  for (var i = 0; i < monthlyAnalytics.length; i++) {
    monthlyAnalytics[i] = 0;
  }
}
function incrMonthlyAnalytics(monthlyAnalytics) {
  try {
    var currentDay = (new Date()).getDate();
    // If we changed month, reset empty days.
    while (lastDay !== currentDay) {
      // Assumption: at least a hit a month.
      lastDay = (lastDay + 1) % monthlyAnalytics.length;
      monthlyAnalytics[lastDay] = 0;
    }
    monthlyAnalytics[currentDay]++;
  } catch(e) { console.error(e.stack); }
}

analyticsAutoLoad();
camp.ajax.on('analytics/v1', function(json, end) { end(analytics); });

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

// Request cache size of 400MB heap limit.
var requestCache = new LruCache(400000000, 'heap');

// Deep error handling for vendor hooks.
var vendorDomain = domain.create();
vendorDomain.on('error', function(err) {
  console.error('Vendor hook error:', err.stack);
});


function cache(f) {
  return function getRequest(data, match, end, ask) {
    // Cache management - no cache, so it won't be cached by GitHub's CDN.
    ask.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    var reqTime = new Date();
    var date = (reqTime).toGMTString();
    ask.res.setHeader('Expires', date);  // Proxies, GitHub, see #221.
    ask.res.setHeader('Date', date);
    incrMonthlyAnalytics(analytics.vendorMonthly);
    if (data.style === 'flat') {
      incrMonthlyAnalytics(analytics.vendorFlatMonthly);
    } else if (data.style === 'flat-square') {
      incrMonthlyAnalytics(analytics.vendorFlatSquareMonthly);
    }

    var cacheIndex = match[0] + '?label=' + data.label + '&style=' + data.style;
    // Should we return the data right away?
    var cached = requestCache.get(cacheIndex);
    var cachedVersionSent = false;
    if (cached !== undefined) {
      // A request was made not long ago.
      var interval = 30000;  // In milliseconds.
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

camp.notfound(/.*/, function(query, match, end, request) {
  end(null, {template: '404.html'});
});



// Vendors.

// Travis integration
camp.route(/^\/travis(-ci)?\/([^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[2];  // eg, espadrine/sc
  var branch = match[3];
  var format = match[4];
  var url = 'https://api.travis-ci.org/' + userRepo + '.svg';
  if (branch != null) {
    url += '?branch=' + branch;
  }
  var badgeData = getBadgeData('build', data);
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
      } else {
        badgeData.text[1] = 'pending';
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Wercker integration
camp.route(/^\/wercker\/ci\/(.+)\.(svg|png|gif|jpg|json)$/,
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
          badgeData.text[1] = build.result;
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

// AppVeyor CI integration.
camp.route(/^\/appveyor\/ci\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, `gruntjs/grunt`.
  var format = match[2];
  var apiUrl = 'https://ci.appveyor.com/api/projects/' + repo;
  var badgeData = getBadgeData('build', data);
  request(apiUrl, { headers: { 'Accept': 'application/json' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      var data = JSON.parse(buffer);
      var status = data.build.status;
      badgeData.text[1] = status;
      if (status === 'success') {
        badgeData.colorscheme = 'brightgreen';
      } else if (status !== 'running' && status !== 'queued') {
        badgeData.colorscheme = 'red';
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
      })

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

// Gratipay integration.
camp.route(/^\/(gittip|gratipay)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[2];  // eg, `JSFiddle`.
  var format = match[3];
  var apiUrl = 'https://www.gratipay.com/' + user + '/public.json';
  var badgeData = getBadgeData('tips', data);
  request(apiUrl, function dealWithData(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (data.receiving) {
        var money = parseInt(data.receiving);
        badgeData.text[1] = '$' + metric(money) + '/week';
        if (money === 0) {
          badgeData.colorscheme = 'red';
        } else if (money < 10) {
          badgeData.colorscheme = 'yellow';
        } else if (money < 100) {
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

// Packagist integration.
camp.route(/^\/packagist\/(dm|dd|dt)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];  // either `dm` or dt`.
  var userRepo = match[2];  // eg, `doctrine/orm`.
  var format = match[3];
  var apiUrl = 'https://packagist.org/packages/' + userRepo + '.json';
  var badgeData = getBadgeData('downloads', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      var data = JSON.parse(buffer);
      switch (info.charAt(1)) {
        case 'm':
          var downloads = data.package.downloads.monthly;
          badgeData.text[1] = metric(downloads) + '/month';
          break;
        case 'd':
          var downloads = data.package.downloads.daily;
          badgeData.text[1] = metric(downloads) + '/day';
          break;
        case 't':
          var downloads = data.package.downloads.total;
          badgeData.text[1] = metric(downloads) + ' total';
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
camp.route(/^\/packagist\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];
  var format = match[2];
  var apiUrl = 'https://packagist.org/packages/' + userRepo + '.json';
  var badgeData = getBadgeData('packagist', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      var data = JSON.parse(buffer);
      var unstable = function(ver) { return /dev/.test(ver); };
      // Grab the latest stable version, or an unstable
      var versions = Object.keys(data.package.versions);
      var version = latestVersion(versions);
      badgeData.text[1] = version;
      if (/^\d/.test(badgeData.text[1])) {
        badgeData.text[1] = 'v' + version;
      }
      if (version[0] === '0' || /dev/.test(version)) {
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

// Packagist license integration.
camp.route(/^\/packagist\/l\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];
  var format = match[2];
  var apiUrl = 'https://packagist.org/packages/' + userRepo + '.json';
  var badgeData = getBadgeData('license', data);
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
      badgeData.colorscheme = 'red';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// npm download integration.
camp.route(/^\/npm\/dm\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, `localeval`.
  var format = match[2];
  var apiUrl = 'https://api.npmjs.org/downloads/point/last-month/' + user;
  var badgeData = getBadgeData('downloads', data);
  request(apiUrl, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var monthly = JSON.parse(buffer).downloads;
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    badgeData.text[1] = metric(monthly) + '/month';
    if (monthly === 0) {
      badgeData.colorscheme = 'red';
    } else if (monthly < 10) {
      badgeData.colorscheme = 'yellow';
    } else if (monthly < 100) {
      badgeData.colorscheme = 'yellowgreen';
    } else if (monthly < 1000) {
      badgeData.colorscheme = 'green';
    } else {
      badgeData.colorscheme = 'brightgreen';
    }
    sendBadge(format, badgeData);
  });
}));

// npm version integration.
camp.route(/^\/npm\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, `localeval`.
  var format = match[2];
  var apiUrl = 'https://registry.npmjs.org/' + repo + '/latest';
  var badgeData = getBadgeData('npm', data);
  // Using the Accept header because of this bug:
  // <https://github.com/npm/npmjs.org/issues/163>
  request(apiUrl, { headers: { 'Accept': '*/*' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      var data = JSON.parse(buffer);
      var version = data.version;
      badgeData.text[1] = 'v' + version;
      if (version[0] === '0' || /dev/.test(version)) {
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

// npm license integration.
camp.route(/^\/npm\/l\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = match[1];  // eg, "express"
  var format = match[2];
  var apiUrl = 'http://registry.npmjs.org/' + repo + '/latest';
  var badgeData = getBadgeData('license', data);
  request(apiUrl, { headers: { 'Accept': '*/*' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      var data = JSON.parse(buffer);
      var license = data.license;
      if (Array.isArray(license)) {
        license = license.join(', ');
      } else if (typeof license == 'object') {
        license = license.type;
      }
      badgeData.text[1] = license;
      badgeData.colorscheme = 'red';
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
  var repo = match[1];  // eg, `localeval`.
  var format = match[2];
  var apiUrl = 'https://registry.npmjs.org/' + repo + '/latest';
  var badgeData = getBadgeData('node', data);
  // Using the Accept header because of this bug:
  // <https://github.com/npm/npmjs.org/issues/163>
  request(apiUrl, { headers: { 'Accept': '*/*' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      var data = JSON.parse(buffer);
      if (data.engines && data.engines.node) {
        var versionRange = data.engines.node;
        badgeData.text[1] = versionRange;
        regularUpdate('http://nodejs.org/dist/latest/SHASUMS.txt',
          (24 * 3600 * 1000),
          function(shasums) {
            var firstLine = shasums.slice(0, shasums.indexOf('\n'));
            var version = firstLine.split('  ')[1].split('-')[1];
            return version;
          }, function(err, version) {
            if (err != null) { sendBadge(format, badgeData); return; }
            if (semver.satisfies(version, versionRange)) {
              badgeData.colorscheme = 'brightgreen';
            } else if (semver.gtr(version, versionRange)) {
              badgeData.colorscheme = 'yellow';
            } else {
              badgeData.colorscheme = 'orange';
            }
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
    }
    try {
      var data = JSON.parse(buffer);
      var version = data.version;
      badgeData.text[1] = 'v' + version;
      if (version[0] === '0' || /dev/.test(version)) {
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

// Gem download count
camp.route(/^\/gem\/(dt|dtv|dv)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];  // either dt, dtv or dv.
  var repo = match[2];  // eg, "rails"
  var splited_url = repo.split('/');
  var repo = splited_url[0];
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
    }
    try {
      var data = JSON.parse(buffer);
      if (info === "dt") {
        var downloads = metric(data.downloads) + " total";
      } else if (info === "dtv") {
        var downloads = metric(data.version_downloads) + " latest version";
      } else if (info === "dv") {
        var downloads = "invalid";

        if (version !== null && version === "stable") {

          var versions = data.filter(function(ver) {
            return ver.prerelease === false;
          }).map(function(ver) {
            return ver.number;
          });
          // Found latest stable version.
          var stable_version = latestVersion(versions);
          var version_data = data.filter(function(ver) {
            return ver.number === stable_version;
          })[0];
          downloads = metric(version_data.downloads_count) + " stable version";

        } else if (version !== null) {

          var version_data = data.filter(function(ver) {
            return ver.number === version;
          })[0];

          downloads = metric(version_data.downloads_count)
            + " version " + version;
        }
      } else { var downloads = "invalid"; }
      badgeData.text[1] = downloads;
      badgeData.colorscheme = downloadCountColor(downloads);
      sendBadge(format, badgeData);
    } catch(e) {
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
    }
    try {
      var data = JSON.parse(buffer);
      if (info.charAt(0) === 'd') {
        badgeData.text[0] = getLabel('downloads', data);
        switch (info.charAt(1)) {
          case 'm':
            var downloads = data.info.downloads.last_month;
            badgeData.text[1] = metric(downloads) + '/month';
            break;
          case 'w':
            var downloads = data.info.downloads.last_week;
            badgeData.text[1] = metric(downloads) + '/week';
            break;
          case 'd':
            var downloads = data.info.downloads.last_day;
            badgeData.text[1] = metric(downloads) + '/day';
            break;
        }
        badgeData.colorscheme = downloadCountColor(downloads);
        sendBadge(format, badgeData);
      } else if (info === 'v') {
        var version = data.info.version;
        badgeData.text[1] = 'v' + version;
        if (version[0] === '0' || /dev/.test(version)) {
          badgeData.colorscheme = 'orange';
        } else {
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      } else if (info == 'l') {
        var license = data.info.license;
        badgeData.text[0] = 'license';
        if (license == null || license == 'UNKNOWN') {
          badgeData.text[1] = 'Unknown';
        } else {
          badgeData.text[1] = license;
          badgeData.colorscheme = 'red';
        }
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
    }
    try {
      var data = JSON.parse(buffer);
      // Grab the latest stable version, or an unstable
      var versions = data.versions;
      var version = latestVersion(versions);
      badgeData.text[1] = version;
      if (/^\d/.test(badgeData.text[1])) {
        badgeData.text[1] = 'v' + version;
      }
      if (version[0] === '0' || /dev/.test(version)) {
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
    }
    try {
      var data = JSON.parse(buffer);
      if (info.charAt(0) === 'd') {
        badgeData.text[0] = getLabel('downloads', data);
        switch (info.charAt(1)) {
          case 'w':
            var downloads = data.downloads.week;
            badgeData.text[1] = metric(downloads) + '/week';
            break;
          case 'd':
            var downloads = data.downloads.day;
            badgeData.text[1] = metric(downloads) + '/day';
            break;
          case 't':
            var downloads = data.downloads.all;
            badgeData.text[1] = metric(downloads) + ' total';
            break;
        }
        badgeData.colorscheme = downloadCountColor(downloads);
        sendBadge(format, badgeData);
      } else if (info === 'v') {
        var version = data.releases[0].version;
        badgeData.text[1] = 'v' + version;
        if (version[0] === '0' || /dev/.test(version)) {
          badgeData.colorscheme = 'orange';
        } else {
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      } else if (info == 'l') {
        var license = (data.meta.licenses || []).join(', ');
        badgeData.text[0] = 'license';
        if ((data.meta.licenses || []).length > 1) badgeData.text[0] += 's';
        if (license == '') {
          badgeData.text[1] = 'Unknown';
        } else {
          badgeData.text[1] = license;
          badgeData.colorscheme = 'red';
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
camp.route(/^\/codecov\/c\/([^\/]+\/[^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];  // eg, `github/codecov/example-python`.
  var branch = match[2];
  var format = match[3];
  var apiUrl = {
    url: 'https://codecov.io/' + userRepo + '/coverage.png',
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
    }
    try {
      var score = res.headers['content-disposition']
                     .match(/filename="coverage_(.+)\.png"/)[1];
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
    }
    try {
      var statusMatch = res.headers['content-disposition']
                           .match(/filename="code_climate-(.+)\.png"/);
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
    branch = repoParts[repoParts.length - 1];
    repo = repoParts.slice(0, -1).join('/');
  }
  var apiUrl = 'https://scrutinizer-ci.com/api/repositories/' + repo;
  var badgeData = getBadgeData('coverage', data);
  request(apiUrl, {}, function(err, res, buffer) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
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
    branch = repoParts[repoParts.length - 1];
    repo = repoParts.slice(0, -1).join('/');
  }
  var apiUrl = 'https://scrutinizer-ci.com/api/repositories/' + repo;
  var badgeData = getBadgeData('code quality', data);
  request(apiUrl, {}, function(err, res, buffer) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
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
camp.route(/^\/david\/(dev\/|peer\/)?(.+?)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var dev = match[1];
  if (dev != null) { dev = dev.slice(0, -1); }  // 'dev' or 'peer'.
  // eg, `strongloop/express`, `webcomponents/generator-element`.
  var userRepo = match[2];
  var format = match[3];
  var options = 'https://david-dm.org/' + userRepo + '/'
    + (dev ? (dev + '-') : '') + 'info.json';
  var badgeData = getBadgeData( (dev? (dev+'D') :'d') + 'ependencies', data);
  request(options, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      var data = JSON.parse(buffer);
      var status = data.status;
      if (status === 'insecure') {
        badgeData.colorscheme = 'red';
        status = 'insecure';
      } else if (status === 'notsouptodate') {
        badgeData.colorscheme = 'yellow';
        status = 'up-to-date';
      } else if (status === 'outofdate') {
        badgeData.colorscheme = 'red';
        status = 'out-of-date';
      } else if (status === 'uptodate') {
        badgeData.colorscheme = 'brightgreen';
        status = 'up-to-date';
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
    }
    try {
      var nameMatch = buffer.match(/(devD|d)ependencies/)[0];
      var statusMatch = buffer.match(/'13'>(.+)<\/text>\n<\/g>/)[1];
      badgeData.text[0] = nameMatch;
      badgeData.text[1] = statusMatch;
      if (statusMatch === 'up-to-date') {
        badgeData.colorscheme = 'brightgreen';
      } else if (statusMatch === 'out-of-date') {
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
      } else if (statusMatch === 'out of date') {
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
camp.route(/^\/codacy\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectId = match[1];
  var format = match[2];
  var url = 'https://www.codacy.com/project/badge/' + projectId;
  var badgeData = getBadgeData('code quality', data);
  fetchFromSvg(request, url, function(err, res) {
      console.log(res);

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
        badgeData.text[1] = 'up-to-date';
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

// GitHub tag integration.
camp.route(/^\/github\/tag\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, strongloop/express
  var repo = match[2];
  var format = match[3];
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo + '/tags';
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  var badgeData = getBadgeData('tag', data);
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: { 'User-Agent': 'Shields.io' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
      var data = JSON.parse(buffer);
      var tag = data[0].name;
      badgeData.text[1] = tag;
      badgeData.colorscheme = 'blue';
      if (/^v[0-9]/.test(tag)) {
        tag = tag.slice(1);
      }
      if (/^[0-9]/.test(tag)) {
        badgeData.text[1] = 'v' + tag;
        if (tag[0] === '0' || /dev/.test(tag)) {
          badgeData.colorscheme = 'orange';
        }
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'none';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub release integration.
camp.route(/^\/github\/release\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte/rubidium
  var repo = match[2];
  var format = match[3];
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo + '/releases';
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  var badgeData = getBadgeData('release', data);
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: { 'User-Agent': 'Shields.io' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
      var data = JSON.parse(buffer);
      var versions = data.map(function(version) { return version.tag_name; });
      var version = latestVersion(versions);
      var prerelease = !!data.filter(function(versionData) {
        return version === versionData.tag_name;
      })[0].prerelease;
      badgeData.text[1] = version;
      badgeData.colorscheme = prerelease ? 'orange' : 'blue';
      if (/^v[0-9]/.test(version)) {
        version = version.slice(1);
      }
      if (/^[0-9]/.test(version)) {
        badgeData.text[1] = 'v' + version;
        if (version[0] === '0' || /dev/.test(version)) {
          badgeData.colorscheme = 'orange';
        }
      }
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'none';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub issues integration.
camp.route(/^\/github\/issues\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte/rubidium
  var repo = match[2];
  var format = match[3];
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo + '';
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  var badgeData = getBadgeData('issues', data);
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: { 'User-Agent': 'Shields.io' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
      var data = JSON.parse(buffer);
      var issues = data.open_issues_count;
      badgeData.text[1] = issues + ' open';
      badgeData.colorscheme = issues ? 'yellow' : 'brightgreen';
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
    }

    try {
      var data = JSON.parse(buffer);
      var version = data.version;
      badgeData.text[1] = 'v' + version;
      if (version[0] === '0' || /dev/.test(version)) {
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

function mapNugetFeed(pattern, offset, getInfo) {
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
      }
      try {
        var downloads = data.DownloadCount;
        badgeData.text[1] = metric(downloads) + ' total';
        badgeData.colorscheme = downloadCountColor(downloads);
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  }));
}

// NuGet and Chocolatey
mapNugetFeed('(nuget|chocolatey)', 1, function(match) {
  var site = match[1];
  return {
    site: site,
    feed: 'https://www.' + site + '.org/api/v2'
  };
});

// MyGet
mapNugetFeed('myget\\/(.*)', 1, function(match) {
  var feed = match[1];
  return {
    site: feed,
    feed: 'https://www.myget.org/F/' + feed + '/api/v2'
  };
});

// Puppet Forge
camp.route(/^\/puppetforge\/v\/([^\/]+\/[^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[1];
  var format = match[2];
  var options = {
    json: true,
    uri: 'https://forge.puppetlabs.com/api/v1/releases.json?module=' + userRepo
  };
  var badgeData = getBadgeData('puppetforge', data);
  request(options, function dealWithData(err, res, json) {
    if (err != null || (json.length !== undefined && json.length === 0)) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var unstable = function(ver) {
        return /-[0-9A-Za-z.-]+(?:\+[0-9A-Za-z.-]+)?$/.test(ver);
      };
      var releases = json[userRepo];
      if (releases.length == 0) {
        badgeData.text[1] = 'none';
        badgeData.colorscheme = 'lightgrey';
        sendBadge(format, badgeData);
        return;
      }
      var versions = releases.map(function(version) {
        return version.version;
      });
      var version = latestVersion(versions);
      if (unstable(version)) {
        badgeData.colorscheme = "yellow";
      } else {
        badgeData.colorscheme = "blue";
      }
      badgeData.text[1] = "v" + version;
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Jenkins build status integration
camp.route(/^\/jenkins(-ci)?\/s\/(http(s)?)\/((?:[^\/]+)(?:\/.+?)?)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[2];  // http(s)
  var host = match[4];  // jenkins.qa.ubuntu.com
  var job = match[5];  // precise-desktop-amd64_default
  var format = match[6];
  var options = {
    json: true,
    uri: scheme + '://' + host + '/job/' + job + '/api/json?tree=color'
  };

  var badgeData = getBadgeData('build', data);
  request(options, function(err, res, json) {
    if (err !== null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }

    try {
      if (json.color === 'blue') {
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
camp.route(/^\/jenkins(-ci)?\/t\/(http(s)?)\/((?:[^\/]+)(?:\/.+?)?)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[2];  // http(s)
  var host = match[4];  // jenkins.qa.ubuntu.com
  var job = match[5];  // precise-desktop-amd64_default
  var format = match[6];
  var options = {
    json: true,
    uri: scheme + '://' + host + '/job/' + job
      + '/lastBuild/api/json?tree=actions[failCount,skipCount,totalCount]'
  };

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

// Codeship.io integration
camp.route(/^\/codeship\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var projectId = match[1];  // eg, `ab123456-00c0-0123-42de-6f98765g4h32`.
  var format = match[2];
  var options = {
    method: 'GET',
    uri: 'https://www.codeship.io/projects/' + projectId + '/status'
  };
  var badgeData = getBadgeData('build', data);
  request(options, function(err, res) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
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
          badgeData.text[1] = 'passed';
          badgeData.colorscheme = 'brightgreen';
          break;
        case 'projectnotfound':
          badgeData.text[1] = 'not found';
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
        badgeData.text[1] = 'v' + version;
        if (version[0] === '0' || /dev/.test(version)) {
          badgeData.colorscheme = 'orange';
        } else {
          badgeData.colorscheme = 'blue';
        }
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
      badgeData.text[1] = metric(total) + ' total';
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
    }
    try {
      var data = JSON.parse(buffer);
      var pluginVersion = data.version;
      if (data.tested) {
        var testedVersion = data.tested.replace(/[^0-9.]/g,'');
        badgeData.text[1] = testedVersion + ' tested';
        var coreUrl = 'https://api.wordpress.org/core/version-check/1.7/';
        request(coreUrl, function(err, res, response) {
          try {
            var versions = JSON.parse(response).offers.map(function(v) {
              return v.version
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
camp.route(/^\/sourceforge\/([^\/]+)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1];      // eg, 'dm'
  var project = match[2];   // eg, 'sevenzip`.
  var format = match[3];
  var apiUrl = 'http://sourceforge.net/projects/' + project + '/files/stats/json';
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
  var uri = 'https://requires.io/api/v1/status/' + userRepo
  if (branch != null) {
    uri += '?branch=' + branch
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
    }
    try {
      if (json.status === 'up-to-date') {
        badgeData.text[1] = 'up-to-date';
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

// Any badge.
camp.route(/^\/(:|badge\/)(([^-]|--)+)-(([^-]|--)+)-(([^-]|--)+)\.(svg|png|gif|jpg)$/,
function(data, match, end, ask) {
  var subject = escapeFormat(match[2]);
  var status = escapeFormat(match[4]);
  var color = escapeFormat(match[6]);
  var format = match[8];

  incrMonthlyAnalytics(analytics.rawMonthly);
  if (data.style === 'flat') {
    incrMonthlyAnalytics(analytics.rawFlatMonthly);
  } else if (data.style === 'flat-square') {
    incrMonthlyAnalytics(analytics.rawFlatSquareMonthly);
  }

  // Cache management - the badge is constant.
  var cacheDuration = (3600*24*1)|0;    // 1 day.
  ask.res.setHeader('Cache-Control', 'public, max-age=' + cacheDuration);
  if (+(new Date(ask.req.headers['if-modified-since'])) >= +serverStartTime) {
    ask.res.statusCode = 304;
    ask.res.end();  // not modified.
    return;
  }
  ask.res.setHeader('Last-Modified', serverStartTime.toGMTString());

  // Badge creation.
  try {
    var badgeData = {text: [subject, status]};
    if (sixHex(color)) {
      badgeData.colorB = '#' + color;
    } else {
      badgeData.colorscheme = color;
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

// Any badge, old version.
camp.route(/^\/([^\/]+)\/(.+).png$/,
function(data, match, end, ask) {
  var subject = match[1];
  var status = match[2];
  var color = data.color;

  // Cache management - the badge is constant.
  var cacheDuration = (3600*24*1)|0;    // 1 day.
  ask.res.setHeader('Cache-Control', 'public, max-age=' + cacheDuration);
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

function sixHex(s) { return /^[0-9a-fA-F]{6}$/.test(s); }

function getLabel(label, data) {
  return data.label || label;
}

function getBadgeData(defaultLabel, data) {
  var label = getLabel(defaultLabel, data);
  var template = data.style || 'default';
  if (data.style && validTemplates.indexOf(data.style) > -1) {
    template = data.style;
  };

  return {text:[label, 'n/a'], colorscheme:'lightgrey', template:template};
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
  svg2img(res, format, askres);
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

// Given a number, string with appropriate unit in the metric system, SI.
// Note: numbers beyond the peta- cannot be represented as integers in JS.
var metricPrefix = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
var metricPower = metricPrefix
    .map(function(a, i) { return Math.pow(1000, i + 1); });
function metric(n) {
  for (var i = metricPrefix.length - 1; i >= 0; i--) {
    var limit = metricPower[i];
    if (n > limit) {
      n = Math.round(n / limit);
      return ''+n + metricPrefix[i];
    }
  }
  return ''+n;
}


// Get data from a svg-style badge.
// cb: function(err, string)
function fetchFromSvg(request, url, cb) {
  request(url, function(err, res, buffer) {
    if (err != null) { return cb(err); }
    try {
      var match = />([^<>]+)<\/text><\/g>/.exec(buffer);
      cb(null, match[1]);
    } catch(e) {
      cb(e);
    }
  });
}

function coveragePercentageColor(percentage) {
  if (percentage < 80) {
    return 'red';
  } else if (percentage < 90) {
    return 'yellow';
  } else if (percentage < 95) {
    return 'green';
  } else {
    return 'brightgreen';
  }
}

function downloadCountColor(downloads) {
  if (downloads === 0) {
    return 'red';
  } else if (downloads < 10) {
    return 'yellow';
  } else if (downloads < 100) {
    return 'yellowgreen';
  } else if (downloads < 1000) {
    return 'green';
  } else {
    return 'brightgreen';
  }
}

// Given a list of versions (as strings), return the latest version.
function latestVersion(versions) {
  var version = '';
  versions = versions.filter(function(version) {
    return (/^v?[0-9]/).test(version);
  });
  versions = versions.map(function(version) {
    var matches = /^(v?[0-9]+)(\.[0-9]+)?(-.*)?$/.exec(version);
    if (matches) {
        version = matches[1] + (matches[2] ? matches[2] : '.0') + '.0' + (matches[3] ? matches[3] : '');
    }
    return version;
  });
  try {
    version = semver.maxSatisfying(versions, '');
  } catch(e) {
    versions = versions.sort();
    version = versions[versions.length - 1];
  }
  return version;
}
