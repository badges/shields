const fs = require('fs');

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

function getAnalytics() {
  return analytics;
}

module.exports = {
  analyticsAutoLoad,
  incrMonthlyAnalytics,
  getAnalytics
};
