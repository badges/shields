'use strict'

const prometheus = require('prom-client')

module.exports = class PrometheusMetrics {
  constructor() {
    this.register = new prometheus.Registry()
    this.requestCounter = new prometheus.Counter({
      name: 'service_requests_total',
      help: 'Total service requests',
      labelNames: ['category', 'family', 'service'],
      registers: [this.register],
    })
  }

  async initialize(server) {
    const { register } = this
    this.interval = prometheus.collectDefaultMetrics({ register })

    server.route(/^\/metrics$/, (data, match, end, ask) => {
      ask.res.setHeader('Content-Type', register.contentType)
      ask.res.end(register.metrics())
    })
  }

  stop() {
    this.register.clear()
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = undefined
    }
  }
}
