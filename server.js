var secureServer = !!process.env.HTTPS;
var serverPort = +process.env.PORT || +process.argv[2] || (secureServer? 443: 80);
var bindAddress = process.env.BIND_ADDRESS || process.argv[3] || '::';
var infoSite = process.env.INFOSITE || "http://shields.io";
var camp = require('camp').start({
  documentRoot: __dirname,
  port: serverPort,
  hostname: bindAddress,
  secure: secureServer
});
console.log('http://[::1]:' + serverPort + '/try.html');
var domain = require('domain');
var request = require('request');
var fs = require('fs');
var LruCache = require('./lru-cache.js');
var badge = require('./badge.js');
var svg2img = require('./svg-to-img.js');
var loadLogos = require('./load-logos.js');
var querystring = require('querystring');
var serverSecrets;
try {
  // Everything that cannot be checked in but is useful server-side
  // is stored in this JSON data.
  serverSecrets = require('./secret.json');
} catch(e) { console.error('No secret data (secret.json, see server.js):', e); }
var semver = require('semver');
var serverStartTime = new Date((new Date()).toGMTString());

var validTemplates = ['default', 'plastic', 'flat', 'flat-square', 'social'];
var logos = loadLogos();

// Analytics

// We can either use a process-wide object regularly saved to a JSON file,
// or a Redis equivalent (for multi-process / when the filesystem is unreliable.
var redis;
var useRedis = false;
if (process.env.REDISTOGO_URL) {
  var redisToGo = require('url').parse(process.env.REDISTOGO_URL);
  redis = require('redis').createClient(redisToGo.port, redisToGo.hostname);
  redis.auth(redisToGo.auth.split(':')[1]);
  useRedis = true;
}

var analytics = {};

var analyticsAutoSaveFileName = process.env.SHIELDS_ANALYTICS_FILE || './analytics.json';
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
var suggest = require('./suggest.js');
camp.ajax.on('analytics/v1', function(json, end) { end(analytics); });
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

    var cacheIndex = match[0] + '?label=' + data.label + '&style=' + data.style
      + '&logo=' + data.logo + '&logoWidth=' + data.logoWidth
      + '&link=' + data.link;
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
        badgeData.text[1] = res;
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// Shippable integration
camp.route(/^\/shippable?\/([^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var project = match[1];  // eg, 54d119db5ab6cc13528ab183
  var branch = match[2];
  var format = match[3];
  var url = 'https://api.shippable.com/projects/' + project + '/badge';
  if (branch != null) {
    url += '?branchName=' + branch;
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
      if (res === 'shippable') {
        badgeData.colorscheme = 'brightgreen';
      } else if (res === 'unshippable') {
        badgeData.colorscheme = 'red';
      } else {
        badgeData.text[1] = res;
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
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
        downloads = data.crate? data.crate.downloads: data.version.downloads;
        version = data.version && data.version.num;
        badgeData.text[1] = metric(downloads) + (version? ' version ' + version: ' total');
        badgeData.colorscheme = downloadCountColor(downloads);
      }
    },
    'dv': {
      name: 'downloads',
      version: true,
      process: function (data, badgeData) {
        downloads = data.version? data.version.downloads: data.versions[0].downloads;
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
      sendBadge(badgeData, format);
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

      var apiUrl = scheme + '://' + serverUrl + '/api/resources?resource=' + buildType
          + '&depth=0&metrics=' + encodeURIComponent(sonarMetricName) + '&includetrends=true';

      var badgeData = getBadgeData(metricName.replace(/_/g, ' '), data);

      request(apiUrl, { headers: { 'Accept': 'application/json' } }, function(err, res, buffer) {
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
          } else if (metricName === 'sqale_debt_ratio' || metricName === 'tech_debt') {
            // colors are based on sonarqube default rating grid and display colors
            // [0,0.1)   ==> A (green)
            // [0.1,0.2) ==> B (yellowgreen)
            // [0.2,0.5) ==> C (yellow)
            // [0.5,1)   ==> D (orange)
            // [1,)      ==> E (red)
            badgeData.text[1] = value + '%';
            if (value > 100) {
              badgeData.colorscheme = 'red';
            } else if (value > 50) {
              badgeData.colorscheme = 'orange';
            } else if (value > 20) {
              badgeData.colorscheme = 'yellow';
            } else if (value > 10) {
              badgeData.colorscheme = 'yellowgreen';
            } else if (value > 0) {
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
        badgeData.colorscheme = 'brightgreen'
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
     badgeData.colorscheme = 'green'
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
        badgeData = JSON.parse(buffer);
        sendBadge(format, badgeData);
      } catch(e) {
        badgeData.text[1] = 'invalid';
        sendBadge(format, badgeData);
      }
    });
  }
}));

// Gratipay integration.
camp.route(/^\/(gittip|gratipay)\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[2];  // eg, `JSFiddle`.
  var format = match[3];
  var apiUrl = 'https://www.gratipay.com/' + user + '/public.json';
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
      badgeData.text[1] = metric(+data.count);
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
        var vdata = versionColor(stableVersion);
        badgeText = vdata.version;
        badgeColor = vdata.color;
        break;
      case 'vpre':
        var unstableVersion = phpLatestVersion(versions);
        //if (!!aliasesMap[unstableVersion]) {
        //  unstableVersion = aliasesMap[unstableVersion];
        //}
        var vdata = versionColor(unstableVersion);
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

// npm download integration.
camp.route(/^\/npm\/dm\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var pkg = encodeURIComponent(match[1]);  // eg, "express" or "@user/express"
  var format = match[2];
  var apiUrl = 'https://api.npmjs.org/downloads/point/last-month/' + pkg;
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

      var downloads = JSON.parse(buffer).downloads;
      for (var index = 0; index < downloads.length; index++) {
        totalDownloads = totalDownloads + downloads[index].downloads;
      }

      badgeData.text[1] = metric(totalDownloads) + ' total';
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
camp.route(/^\/npm\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = encodeURIComponent(match[1]);  // eg, "express" or "@user/express"
  var format = match[2];
  var apiUrl = 'https://registry.npmjs.org/' + repo + '/latest';
  var badgeData = getBadgeData('npm', data);
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

// npm license integration.
camp.route(/^\/npm\/l\/(.*)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var repo = encodeURIComponent(match[1]);  // eg, "express" or "@user/express"
  var format = match[2];
  var apiUrl = 'http://registry.npmjs.org/' + repo + '/latest';
  var badgeData = getBadgeData('license', data);
  request(apiUrl, { headers: { 'Accept': '*/*' } }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
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
        regularUpdate('http://nodejs.org/dist/latest/SHASUMS.txt',
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
    }
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
      var vdata = versionColor(data.version);
      badgeData.text[1] = "[" + clojar + " \"" + data.version + "\"]";
      badgeData.colorscheme = 'brightgreen';
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
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (info === "dt") {
        var downloads = metric(data.downloads);
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
      sendBadge(badgeData, format);
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
  })
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
      sendBadge(badgeData, format);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      if (totalRank) {
        var rank = data[0].total_ranking;
      } else if (dailyRank) {
        var rank = data[0].daily_ranking;
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
  })
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
        var releases = data.releases[data.info.version];
        var hasWheel = false;
        for (var i = 0; i < releases.length; i++) {
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
        var releases = data.releases[data.info.version];
        var hasWheel = false;
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
        var pattern = /^Programming Language \:\: Python \:\: ([\d\.]+)$/;
        for (var i = 0; i < data.info.classifiers.length; i++) {
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
        var pattern = /^Programming Language \:\: Python \:\: Implementation \:\: (\S+)$/;
        for (var i = 0; i < data.info.classifiers.length; i++) {
          var matched = pattern.exec(data.info.classifiers[i]);
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
        var pattern = /^Development Status \:\: ([1-7]) - (\S+)$/;
        var statusColors = {
            '1': 'red', '2': 'red', '3': 'red', '4': 'yellow',
            '5': 'brightgreen', '6': 'brightgreen', '7': 'red'};
        var statusCode = '1', statusText = 'unknown';
        for (var i = 0; i < data.info.classifiers.length; i++) {
          var matched = pattern.exec(data.info.classifiers[i]);
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
  queryParams = {};
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
      return;
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
    branch = repoParts[repoParts.length - 1];
    repo = repoParts.slice(0, -1).join('/');
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
      var res = data.applications[branch].build_status.status;
      badgeData.text[1] = res;
      if (res === 'passed') {
        badgeData.colorscheme = 'brightgreen';
      } else if (res === 'failed' || res === 'error') {
        badgeData.colorscheme = 'red';
      } else if (res === 'pending') {
        badgeData.colorscheme = 'orange';
      } else if (res === 'unknown') {
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
    branch = repoParts[repoParts.length - 1];
    repo = repoParts.slice(0, -1).join('/');
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
        status = 'up-to-date';
      } else if (status === 'outofdate') {
        badgeData.colorscheme = 'red';
        status = 'out-of-date';
      } else if (status === 'uptodate') {
        badgeData.colorscheme = 'brightgreen';
        status = 'up-to-date';
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
      var statusMatch = buffer.match(/'14'>(.+)<\/text>\n<\/g>/)[1];
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
  var projectId = match[1];  // eg. e27821fb6289410b8f58338c7e0bc686
  var format = match[2];
  var url = 'https://www.codacy.com/project/badge/' + projectId;
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
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: githubHeaders }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
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

// GitHub release integration.
camp.route(/^\/github\/release\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte/rubidium
  var repo = match[2];
  var format = match[3];
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo + '/releases/latest';
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  var badgeData = getBadgeData('release', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: githubHeaders }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
      var data = JSON.parse(buffer);
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
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo + '/compare/' + version + '...master';
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  var badgeData = getBadgeData('commits since ' + version, data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: githubHeaders }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
      var data = JSON.parse(buffer);
      badgeData.text[1] = data.ahead_by;
      badgeData.colorscheme = 'blue';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'none';
      sendBadge(format, badgeData);
    }
  });
}));

// GitHub release-download-count integration.
camp.route(/^\/github\/downloads\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var user = match[1];  // eg, qubyte/rubidium
  var repo = match[2];
  var tag = match[3];
  var asset_name = match[4].toLowerCase(); // eg. total, atom-amd64.deb, atom.x86_64.rpm
  var format = match[5];
  var release_path = tag !== 'latest' ? 'tags/' + match[3] : 'latest';
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo + '/releases/' + release_path;
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  var badgeData = getBadgeData('downloads', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: githubHeaders }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      return sendBadge(format, badgeData);
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
      var data = JSON.parse(buffer);
      var downloads = 0;
      data.assets.forEach(function (asset) {
        if (asset_name === 'total' || asset_name === asset.name.toLowerCase()) {
          downloads += asset.download_count;
        }
      });
      var label = tag !== 'latest' ?  tag : '';
      if (asset_name !== 'total') {
        label += ' ' + '[' + asset_name + ']';
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
camp.route(/^\/github\/issues(-raw)?\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var isRaw = !!match[1];
  var user = match[2];  // eg, qubyte/rubidium
  var repo = match[3];
  var format = match[4];
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo;
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  var badgeData = getBadgeData('issues', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: githubHeaders }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
      var data = JSON.parse(buffer);
      var issues = data.open_issues_count;
      badgeData.text[1] = issues + (isRaw? '': ' open');
      badgeData.colorscheme = issues ? 'yellow' : 'brightgreen';
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
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo;
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  var badgeData = getBadgeData('forks', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
    badgeData.links = [
      'https://github.com/' + user + '/' + repo + '/fork',
      'https://github.com/' + user + '/' + repo + '/network',
     ];
  }
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: githubHeaders }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
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
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo;
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  var badgeData = getBadgeData('stars', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
    badgeData.links = [
      'https://github.com/' + user + '/' + repo,
      'https://github.com/' + user + '/' + repo + '/stargazers',
     ];
  }
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: githubHeaders }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
      badgeData.text[1] = JSON.parse(buffer).stargazers_count;
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
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo;
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  var badgeData = getBadgeData('watchers', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
    badgeData.links = [
      'https://github.com/' + user + '/' + repo,
      'https://github.com/' + user + '/' + repo + '/watchers',
     ];
  }
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: githubHeaders }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
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
  var apiUrl = 'https://api.github.com/users/' + user;
  // Using our OAuth App secret grants us 5000 req/hour
  // instead of the standard 60 req/hour.
  if (serverSecrets) {
    apiUrl += '?client_id=' + serverSecrets.gh_client_id
      + '&client_secret=' + serverSecrets.gh_client_secret;
  }
  var badgeData = getBadgeData('followers', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.github;
  }
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  request(apiUrl, { headers: githubHeaders }, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      }
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
  var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo;
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
      if ((+res.headers['x-ratelimit-remaining']) === 0) {
        return;  // Hope for the best in the cache.
      } else if (res.statusCode === 404) {
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
        badgeData.text[1] = metric(total) + ' total';
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

// Ansible integration
camp.route(/^\/ansible\/(role)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var type = match[1];      // eg role
  var roleId = match[2];    // eg 3078
  var format = match[3];
  var uri = 'https://galaxy.ansible.com/api/v1/roles/' + roleId + '/';
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
        badgeData.text[1] = json.summary_fields.owner.username +
          '.' + json.name;
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
    uri: 'https://www.codeship.io/projects/' + projectId + '/status' + (branch != null ? '?branch=' + branch : '')
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
          badgeData.text[1] = 'passed';
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
      return;
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
      return;
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
    badgeData.text[1] = metric(dls) + ' total';
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

// Talk integration
camp.route(/^\/talk\/t\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var roomHash = match[1];  // eg, 9c81ff703b
  var format = match[2];
  var url = 'https://guest.talk.ai/api/rooms/' + roomHash;
  var badgeData = getBadgeData('talk', data);
  request(url, function(err, res, buffer) {
    try {
      room = JSON.parse(buffer);
      badgeData.text[1] = room.topic;
      badgeData.colorscheme = room.color;
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));

// CircleCI build integration.
// https://circleci.com/api/v1/project/BrightFlair/PHP.Gt?circle-token=0a5143728784b263d9f0238b8d595522689b3af2&limit=1&filter=completed
camp.route(/^\/circleci\/(?:token\/(\w+))?[+\/]?project\/([^\/]+\/[^\/]+)(?:\/(.*))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var token = match[1]
  var userRepo = match[2];  // eg, `BrightFlair/PHP.Gt`.
  var branch = match[3];
  var format = match[4];

  // Base API URL
  var apiUrl = 'https://circleci.com/api/v1/project/' + userRepo;

  // Query Params
  queryParams = {};
  queryParams['limit'] = 1;
  queryParams['filter'] = 'completed';

  // Custom Banch if present
  if(branch != null) {
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
      default:
        badgeData.text[1] = status.replace('_', ' ');
        break;
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

// CTAN integration.
camp.route(/^\/ctan\/([^\/])\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var info = match[1]; // either `v` or `l`
  var pkg = match[2]; // eg, tex
  var format = match[3];
  var url = 'http://www.ctan.org/json/pkg/' + pkg;
  var badgeData = getBadgeData('ctan', data);
  request(url, function (err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(badgeData, format);
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
        var license = data.license;
        if (license === '') {
          badgeData.text[1] = 'Unknown';
        } else {
          badgeData.text[1] = license;
          badgeData.colorscheme = 'blue';
        }
        sendBadge(format, badgeData);
      }
    } catch (e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  })}
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
  var url = 'https://registry.hub.docker.com/v2/repositories/' + path + '/stars/count/';
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
  var url = 'https://registry.hub.docker.com/v2/repositories/' + path;
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

// Twitter integration.
camp.route(/^\/twitter\/url\/([^\/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var scheme = match[1]; // eg, https
  var path = match[2];   // eg, shields.io
  var format = match[3];
  var page = encodeURIComponent(scheme + '://' + path);
  var url = 'http://cdn.api.twitter.com/1/urls/count.json?url=' + page;
  var badgeData = getBadgeData('tweet', data);
  if (badgeData.template === 'social') {
    badgeData.logo = badgeData.logo || logos.twitter;
    badgeData.links = [
      'https://twitter.com/intent/tweet?text=Wow:&url=' + page,
      'https://twitter.com/search?q=' + page,
     ];
  }
  request(url, function(err, res, buffer) {
    if (err != null) {
      badgeData.text[1] = 'inaccessible';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var data = JSON.parse(buffer);
      badgeData.text[1] = metric(data.count);
      badgeData.colorscheme = '55ACEE';
      sendBadge(format, badgeData);
    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
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


// Any badge.
camp.route(/^\/(:|badge\/)(([^-]|--)*?)-(([^-]|--)*)-(([^-]|--)+)\.(svg|png|gif|jpg)$/,
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

  if (ask.req.headers['cache-control']) {
    ask.res.setHeader('Cache-Control', ask.req.headers['cache-control']);
  } else {
    // Cache management - the badge is constant.
    var cacheDuration = (3600*24*1)|0;    // 1 day.
    ask.res.setHeader('Cache-Control', 'public, max-age=' + cacheDuration);
  }
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

// data (URL query) can include `label`, `style`, `logo`, `logoWidth`, `link`.
function getBadgeData(defaultLabel, data) {
  var label = getLabel(defaultLabel, data);
  var template = data.style || 'default';
  if (data.style && validTemplates.indexOf(data.style) > -1) {
    template = data.style;
  };

  if (data.logo !== undefined && !/^data:/.test(data.logo)) {
    data.logo = 'data:' + data.logo;
  }

  return {
    text: [label, 'n/a'],
    colorscheme: 'lightgrey',
    template: template,
    logo: data.logo,
    logoWidth: +data.logoWidth,
    links: data.link,
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

var githubHeaders = {
  'User-Agent': 'Shields.io',
  'Accept': 'application/vnd.github.v3+json'
};

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
      var badge = buffer.replace(/(?:\r\n\s*|\r\s*|\n\s*)/g, '');
      var match = />([^<>]+)<\/text><\/g>/.exec(badge);
      cb(null, match[1]);
    } catch(e) {
      cb(e);
    }
  });
}

function ordinalNumber(n) {
  var s=["ᵗʰ","ˢᵗ","ⁿᵈ","ʳᵈ"], v=n%100;
  return n+(s[(v-20)%10]||s[v]||s[0]);
}

function coveragePercentageColor(percentage) {
  return floorCountColor(percentage, 80, 90, 100);
}

function downloadCountColor(downloads) {
  return floorCountColor(downloads, 10, 100, 1000);
}

function floorCountColor(value, yellow, yellowgreen, green) {
  if (value === 0) {
    return 'red';
  } else if (value < yellow) {
    return 'yellow';
  } else if (value < yellowgreen) {
    return 'yellowgreen';
  } else if (value < green) {
    return 'green';
  } else {
    return 'brightgreen';
  }
}

function versionColor(version) {
  var first = version[0];
  if (first === 'v') {
    first = version[1];
  } else if (/^[0-9]/.test(version)) {
    version = 'v' + version;
  }
  if (first === '0' || (version.indexOf('-') !== -1)) {
    return { version: version, color: 'orange' };
  } else {
    return { version: version, color: 'blue' };
  }
}

// Given a list of versions (as strings), return the latest version.
function latestVersion(versions) {
  var version = '';
  var origVersions = versions;
  versions = versions.filter(function(version) {
    return (/^v?[0-9]/).test(version);
  });
  semver_versions = versions.map(function(version) {
    var matches = /^(v?[0-9]+)(\.[0-9]+)?(-.*)?$/.exec(version);
    if (matches) {
      version = matches[1] + (matches[2] ? matches[2] : '.0') + '.0' +
        (matches[3] ? matches[3] : '');
    }
    return version;
  });
  try {
    version = semver.maxSatisfying(semver_versions, '');
    version = versions[semver_versions.indexOf(version)];
  } catch(e) {
    versions = versions.sort();
    version = versions[versions.length - 1];
  }
  if (version === undefined) {
    origVersions = origVersions.sort();
    version = origVersions[origVersions.length - 1];
  }
  return version;
}

// Return a negative value if v1 < v2,
// zero if v1 = v2, a positive value otherwise.
function asciiVersionCompare(v1, v2) {
  if (v1 < v2) {
    return -1;
  } else if (v1 > v2) {
    return 1;
  } else {
    return 0;
  }
}

// Remove the starting v in a string.
function omitv(version) {
  if (version.charCodeAt(0) === 118) { // v
    return version.slice(1);
  } else {
    return version;
  }
}

// Take a version without the starting v.
// eg, '1.0.x-beta'
// Return { numbers: [1,0,something big], modifier: 2, modifierCount: 1 }
function phpNumberedVersionData(version) {
  // A version has a numbered part and a modifier part
  // (eg, 1.0.0-patch, 2.0.x-dev).
  var parts = version.split('-');
  var numbered = parts[0];

  // Aliases that get caught here.
  if (numbered === 'dev') {
    return {
      numbers: parts[1],
      modifier: 5,
      modifierCount: 1,
    };
  }

  var modifierLevel = 3;
  var modifierLevelCount = 0;

  if (parts.length > 1) {
    var modifier = parts[parts.length - 1];
    var firstLetter = modifier.charCodeAt(0);
    var modifierLevelCountString;

    // Modifiers: alpha < beta < RC < normal < patch < dev
    if (firstLetter === 97) { // a
      modifierLevel = 0;
      if (/^alpha/.test(modifier)) {
        modifierLevelCountString = + (modifier.slice(5));
      } else {
        modifierLevelCountString = + (modifier.slice(1));
      }
    } else if (firstLetter === 98) { // b
      modifierLevel = 1;
      if (/^beta/.test(modifier)) {
        modifierLevelCountString = + (modifier.slice(4));
      } else {
        modifierLevelCountString = + (modifier.slice(1));
      }
    } else if (firstLetter === 82) { // R
      modifierLevel = 2;
      modifierLevelCountString = + (modifier.slice(2));
    } else if (firstLetter === 112) { // p
      modifierLevel = 4;
      if (/^patch/.test(modifier)) {
        modifierLevelCountString = + (modifier.slice(5));
      } else {
        modifierLevelCountString = + (modifier.slice(1));
      }
    } else if (firstLetter === 100) { // d
      modifierLevel = 5;
      if (/^dev/.test(modifier)) {
        modifierLevelCountString = + (modifier.slice(3));
      } else {
        modifierLevelCountString = + (modifier.slice(1));
      }
    }

    // If we got the empty string, it defaults to a modifier count of 1.
    if (!modifierLevelCountString) {
      modifierLevelCount = 1;
    } else {
      modifierLevelCount = + modifierLevelCountString;
    }
  }

  // Try to convert to a list of numbers.
  var toNum = function(s) {
    var n = +s;
    if (n !== n) {  // If n is NaN…
      n = 0xffffffff;
    }
    return n;
  };
  var numberList = numbered.split('.').map(toNum);

  return {
    numbers: numberList,
    modifier: modifierLevel,
    modifierCount: modifierLevelCount,
  };
}

function listCompare(a, b) {
  for (var i = 0; i < a.length; i++) {
    if (a[i] < b[i]) {
      return -1;
    } else if (a[i] > b[i]) {
      return 1;
    }
  }
  if (a.length < b.length) {
    return -1;
  } else if (a.length > b.length) {
    return 1;
  } else {
    return 0;
  }
}

// Return a negative value if v1 < v2,
// zero if v1 = v2,
// a positive value otherwise.
//
// See https://getcomposer.org/doc/04-schema.md#version
// and https://github.com/badges/shields/issues/319#issuecomment-74411045
function phpVersionCompare(v1, v2) {
  // Omit the starting `v`.
  var rawv1 = omitv(v1);
  var rawv2 = omitv(v2);
  try {
    var v1data = phpNumberedVersionData(rawv1);
    var v2data = phpNumberedVersionData(rawv2);
  } catch(e) {
    return asciiVersionCompare(rawv1, rawv2);
  }

  // Compare the numbered part (eg, 1.0.0 < 2.0.0).
  var numbersCompare = listCompare(v1data.numbers, v2data.numbers);
  if (numbersCompare !== 0) {
    return numbersCompare;
  }

  // Compare the modifiers (eg, alpha < beta).
  if (v1data.modifier < v2data.modifier) {
    return -1;
  } else if (v1data.modifier > v2data.modifier) {
    return 1;
  }

  // Compare the modifier counts (eg, alpha1 < alpha3).
  if (v1data.modifierCount < v2data.modifierCount) {
    return -1;
  } else if (v1data.modifierCount > v2data.modifierCount) {
    return 1;
  }

  return 0;
}

function phpLatestVersion(versions) {
  var latest = versions[0];
  for (var i = 1; i < versions.length; i++) {
    if (phpVersionCompare(latest, versions[i]) < 0) {
      latest = versions[i];
    }
  }
  return latest;
}

// Whether a version is stable.
function phpStableVersion(version) {
  var rawVersion = omitv(version);
  try {
    var versionData = phpNumberedVersionData(version);
  } catch(e) {
    return false;
  }
  // normal or patch
  return (versionData.modifier === 3) || (versionData.modifier === 4);
}
