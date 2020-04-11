'use strict'

const decamelize = require('decamelize')
const prometheus = require('prom-client')

module.exports = class PrometheusMetrics {
  constructor({ register } = {}) {
    this.register = register || new prometheus.Registry()
    this.counters = {
      numRequests: new prometheus.Counter({
        name: 'service_requests_total',
        help: 'Total service requests',
        labelNames: ['category', 'family', 'service'],
        registers: [this.register],
      }),
      responseTime: new prometheus.Histogram({
        name: 'service_response_millis',
        help: 'Service response time in milliseconds',
        // 250 ms increments up to 2 seconds, then 500 ms increments up to 8
        // seconds, then 1 second increments up to 15 seconds.
        buckets: [
          250,
          500,
          750,
          1000,
          1250,
          1500,
          1750,
          2000,
          2250,
          2500,
          2750,
          3000,
          3250,
          3500,
          3750,
          4000,
          4500,
          5000,
          5500,
          6000,
          6500,
          7000,
          7500,
          8000,
          9000,
          10000,
          11000,
          12000,
          13000,
          14000,
          15000,
        ],
        registers: [this.register],
      }),
      rateLimitExceeded: new prometheus.Counter({
        name: 'rate_limit_exceeded_total',
        help: 'Count of rate limit exceeded by type',
        labelNames: ['rate_limit_type'],
        registers: [this.register],
      }),
      serviceResponseSize: new prometheus.Histogram({
        name: 'service_response_bytes',
        help: 'Service response size in bytes',
        labelNames: ['category', 'family', 'service'],
        // buckets: 64KiB, 128KiB, 256KiB, 512KiB, 1MiB, 2MiB, 4MiB, 8MiB
        buckets: prometheus.exponentialBuckets(64 * 1024, 2, 8),
        registers: [this.register],
      }),
    }
    this.interval = prometheus.collectDefaultMetrics({
      register: this.register,
    })
  }

  async registerMetricsEndpoint(server) {
    const { register } = this

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

  metrics() {
    return this.register.getMetricsAsJSON()
  }

  /**
   * @returns {object} `{ inc() {} }`.
   */
  createNumRequestCounter({ category, serviceFamily, name }) {
    const service = decamelize(name)
    return this.counters.numRequests.labels(category, serviceFamily, service)
  }

  noteResponseTime(responseTime) {
    return this.counters.responseTime.observe(responseTime)
  }

  noteRateLimitExceeded(rateLimitType) {
    return this.counters.rateLimitExceeded.labels(rateLimitType).inc()
  }

  createServiceResponseSizeHistogram({ category, serviceFamily, name }) {
    const service = decamelize(name)
    return this.counters.serviceResponseSize.labels(
      category,
      serviceFamily,
      service
    )
  }
}
