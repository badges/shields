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

function setRoutes({ rateLimit }, server) {
  const ipRateLimit = new RateLimit({
    whitelist: /^192\.30\.252\.\d+$/, // Whitelist GitHub IPs.
  })
  const badgeTypeRateLimit = new RateLimit({ maxHitsPerPeriod: 3000 })
  const refererRateLimit = new RateLimit({
    maxHitsPerPeriod: 300,
    whitelist: /^https?:\/\/shields\.io\/$/,
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
      const badgeType = req.url
        .split(/[/-]/)
        .slice(0, 3)
        .join('')
      const referer = req.headers['referer']

      if (ipRateLimit.isBanned(ip, req, res)) {
        return
      }
      if (badgeTypeRateLimit.isBanned(badgeType, req, res)) {
        return
      }
      if (refererRateLimit.isBanned(referer, req, res)) {
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

  return function() {
    ipRateLimit.stop()
    badgeTypeRateLimit.stop()
    refererRateLimit.stop()
  }
}

module.exports = {
  setRoutes,
}
