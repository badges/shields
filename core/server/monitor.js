'use strict'

const config = require('config').util.toObject()
const secretIsValid = require('./secret-is-valid')
const RateLimit = require('./rate-limit')
const log = require('./log')

function secretInvalid(req, res) {
  if (!secretIsValid(req.password)) {
    // An unknown entity tries to connect. Let the connection linger for a minute.
    setTimeout(() => {
      res.json({ errors: [{ code: 'invalid_secrets' }] })
    }, 10000)
    return true
  }
  return false
}

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
    if (req.url.startsWith('/sys/')) {
      if (secretInvalid(req, res)) {
        return
      }
    }

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

  server.get('/sys/network', (req, res) => {
    res.json({ ips: config.public.shields_ips })
  })

  server.ws('/sys/logs', socket => {
    const listener = (...msg) => socket.send(msg.join(' '))
    socket.on('close', () => log.removeListener(listener))
    socket.on('message', msg => {
      let req
      try {
        req = JSON.parse(msg)
      } catch (e) {
        return
      }
      if (!secretIsValid(req.secret)) {
        return socket.close()
      }
      log.addListener(listener)
    })
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

module.exports = {
  setRoutes,
}
