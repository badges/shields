'use strict'

const prometheus = require('prom-client')

module.exports = class PrometheusMetrics {
  constructor(config = {}) {
    this.enabled = config.enabled || false
    if (this.enabled) {
      console.log('Metrics are enabled.')
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
      ask.res.setHeader('Content-Type', register.contentType)
      ask.res.end(register.metrics())
    })
  }
}
