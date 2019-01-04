'use strict'

const fs = require('fs')
const { URL } = require('url')

// We can either use a process-wide object regularly saved to a JSON file,
// or a Redis equivalent (for multi-process / when the filesystem is unreliable.
let redis
let useRedis = false
if (process.env.REDISTOGO_URL) {
  const { port, hostname, password } = new URL(process.env.REDISTOGO_URL)
  redis = require('redis').createClient(port, hostname)
  redis.auth(password)
  useRedis = true
}

let analytics = {}
let autosaveIntervalId

const analyticsPath = process.env.SHIELDS_ANALYTICS_FILE || './analytics.json'

function performAutosave() {
  const contents = JSON.stringify(analytics)
  if (useRedis) {
    redis.set(analyticsPath, contents)
  } else {
    fs.writeFileSync(analyticsPath, contents)
  }
}

function scheduleAutosaving() {
  const analyticsAutoSavePeriod = 10000
  autosaveIntervalId = setInterval(performAutosave, analyticsAutoSavePeriod)
}

// For a clean shutdown.
function cancelAutosaving() {
  if (autosaveIntervalId) {
    clearInterval(autosaveIntervalId)
    autosaveIntervalId = null
  }
  performAutosave()
}

function defaultAnalytics() {
  const analytics = Object.create(null)
  // In case something happens on the 36th.
  analytics.vendorMonthly = new Array(36)
  resetMonthlyAnalytics(analytics.vendorMonthly)
  analytics.rawMonthly = new Array(36)
  resetMonthlyAnalytics(analytics.rawMonthly)
  analytics.vendorFlatMonthly = new Array(36)
  resetMonthlyAnalytics(analytics.vendorFlatMonthly)
  analytics.rawFlatMonthly = new Array(36)
  resetMonthlyAnalytics(analytics.rawFlatMonthly)
  analytics.vendorFlatSquareMonthly = new Array(36)
  resetMonthlyAnalytics(analytics.vendorFlatSquareMonthly)
  analytics.rawFlatSquareMonthly = new Array(36)
  resetMonthlyAnalytics(analytics.rawFlatSquareMonthly)
  return analytics
}

function load() {
  const defaultAnalyticsObject = defaultAnalytics()
  if (useRedis) {
    redis.get(analyticsPath, (err, value) => {
      if (err == null && value != null) {
        // if/try/return trick:
        // if error, then the rest of the function is run.
        try {
          analytics = JSON.parse(value)
          // Extend analytics with a new value.
          for (const key in defaultAnalyticsObject) {
            if (!(key in analytics)) {
              analytics[key] = defaultAnalyticsObject[key]
            }
          }
          return
        } catch (e) {
          console.error('Invalid Redis analytics, resetting.')
          console.error(e)
        }
      }
      analytics = defaultAnalyticsObject
    })
  } else {
    // Not using Redis.
    try {
      analytics = JSON.parse(fs.readFileSync(analyticsPath))
      // Extend analytics with a new value.
      for (const key in defaultAnalyticsObject) {
        if (!(key in analytics)) {
          analytics[key] = defaultAnalyticsObject[key]
        }
      }
    } catch (e) {
      if (e.code !== 'ENOENT') {
        console.error('Invalid JSON file for analytics, resetting.')
        console.error(e)
      }
      analytics = defaultAnalyticsObject
    }
  }
}

let lastDay = new Date().getDate()
function resetMonthlyAnalytics(monthlyAnalytics) {
  for (let i = 0; i < monthlyAnalytics.length; i++) {
    monthlyAnalytics[i] = 0
  }
}
function incrMonthlyAnalytics(monthlyAnalytics) {
  try {
    const currentDay = new Date().getDate()
    // If we changed month, reset empty days.
    while (lastDay !== currentDay) {
      // Assumption: at least a hit a month.
      lastDay = (lastDay + 1) % monthlyAnalytics.length
      monthlyAnalytics[lastDay] = 0
    }
    monthlyAnalytics[currentDay]++
  } catch (e) {
    console.error(e.stack)
  }
}

function noteRequest(queryParams, match) {
  incrMonthlyAnalytics(analytics.vendorMonthly)
  if (queryParams.style === 'flat') {
    incrMonthlyAnalytics(analytics.vendorFlatMonthly)
  } else if (queryParams.style === 'flat-square') {
    incrMonthlyAnalytics(analytics.vendorFlatSquareMonthly)
  }
}

function setRoutes(server) {
  server.ajax.on('analytics/v1', (json, end) => {
    end(analytics)
  })
}

module.exports = {
  load,
  scheduleAutosaving,
  cancelAutosaving,
  noteRequest,
  setRoutes,
}
