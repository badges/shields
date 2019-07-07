'use strict'

const prometheus = require('prom-client')

module.exports = class PrometheusMetrics {
  constructor() {
    this.register = new prometheus.Registry()
    this.metrics = {
      requestCounter: new prometheus.Counter({
        name: 'service_requests_total',
        help: 'Total service requests',
        labelNames: ['category', 'family', 'service'],
        registers: [this.register],
      }),
      serviceResponseSize: new prometheus.Histogram({
        name: 'service_response_bytes',
        help: 'Service response size in bytes',
        labelNames: ['type'],
        // buckets form 64kB to 8MB
        buckets: prometheus.exponentialBuckets(64 * 1024, 2, 8),
        registers: [this.register],
      }),
    }
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
