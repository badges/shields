'use strict'

const prometheus = require('prom-client')

const { register } = prometheus

module.exports = class PrometheusMetrics {
  constructor() {
    this.requestCounter = new prometheus.Counter({
      name: 'service_requests_total',
      help: 'Total service requests',
      labelNames: ['category', 'family', 'service'],
    })
  }

  async initialize(server) {
    prometheus.collectDefaultMetrics()
    this.setRoutes(server, register)
  }

  setRoutes(server, register) {
    server.route(/^\/metrics$/, (data, match, end, ask) => {
      ask.res.setHeader('Content-Type', register.contentType)
      ask.res.end(register.metrics())
    })
  }
}
