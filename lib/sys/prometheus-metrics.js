'use strict'

const prometheus = require('prom-client')

class PrometheusMetrics {
  constructor(config = {}) {
    this.enabled = config.enabled || false
    const matchNothing = /(?!)/
    this.allowedIps = config.allowedIps
      ? new RegExp(config.allowedIps)
      : matchNothing
    if (this.enabled) {
      console.log(
        `Metrics are enabled. Access to /metrics resoure is limited to IP addresses matching: ${
          this.allowedIps
        }`
      )
    }
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
      const ip = ask.req.socket.remoteAddress
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
