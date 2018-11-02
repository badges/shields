'use strict'

const prometheus = require('prom-client')

class PrometheusMetrics {
  constructor(config) {
    this.enabled = config.enabled
    // /(?!)/ matches nothing
    this.allowedIps = config.allowedIps ? new RegExp(config.allowedIps) : /(?!)/
  }

  async initialize(server) {
    if (this.enabled) {
      const register = prometheus.register
      prometheus.collectDefaultMetrics()
      this.setRoutes(server, register)
    }
  }

  setRoutes(server, register) {
    server.route(/^\/metrics$/, (data, match, end, ask) => {
      const ip =
        (ask.req.headers['x-forwarded-for'] || '').split(', ')[0] ||
        ask.req.socket.remoteAddress
      if (this.allowedIps.test(ip)) {
        ask.res.setHeader('Content-Type', register.contentType)
        ask.res.end(register.metrics())
      } else {
        ask.res.statusCode = 403
        ask.res.end()
      }
    })
  }
}

module.exports = PrometheusMetrics
