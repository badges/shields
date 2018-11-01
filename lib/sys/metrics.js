'use strict'

const { setRoutes } = require('./metrics-routes')
const prometheus = require('prom-client')

class Metrics {
  constructor(config) {
    this.config = config
  }

  async initialize(server) {
    if (this.config.prometheus.enabled) {
      const register = prometheus.register
      prometheus.collectDefaultMetrics()
      setRoutes(server, register)
    }
  }
}

module.exports = Metrics
