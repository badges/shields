'use strict'

const RateLimit = require('./rate-limit')

function setRoutes({ rateLimit }, { server, metricInstance }) {
  const ipRateLimit = new RateLimit({
    // Exclude IPs for GitHub Camo, determined experimentally by running e.g.
    // `curl --insecure -u ":shields-secret" https://s0.shields-server.com/sys/rate-limit`
    safelist: /^(?:192\.30\.252\.\d+)|(?:140\.82\.115\.\d+)$/,
  })
  const badgeTypeRateLimit = new RateLimit({ maxHitsPerPeriod: 3000 })
  const refererRateLimit = new RateLimit({
    maxHitsPerPeriod: 300,
    safelist: /^https?:\/\/shields\.io\/$/,
  })

  server.handle((req, res, next) => {
    if (rateLimit) {
      const ip =
        (req.headers['x-forwarded-for'] || '').split(', ')[0] ||
        req.socket.remoteAddress
      const badgeType = req.url.split(/[/-]/).slice(0, 3).join('')
      const referer = req.headers.referer

      if (ipRateLimit.isBanned(ip, req, res)) {
        metricInstance.noteRateLimitExceeded('ip')
        return
      }
      if (badgeTypeRateLimit.isBanned(badgeType, req, res)) {
        metricInstance.noteRateLimitExceeded('badge_type')
        return
      }
      if (refererRateLimit.isBanned(referer, req, res)) {
        metricInstance.noteRateLimitExceeded('referrer')
        return
      }
    }

    next()
  })

  server.get('/sys/rate-limit', (req, res) => {
    res.json({
      ip: ipRateLimit.toJSON(),
      badgeType: badgeTypeRateLimit.toJSON(),
      referer: refererRateLimit.toJSON(),
    })
  })

  return function () {
    ipRateLimit.stop()
    badgeTypeRateLimit.stop()
    refererRateLimit.stop()
  }
}

module.exports = { setRoutes }
