import decamelize from 'decamelize'
import prometheus from 'prom-client'

export default class PrometheusMetrics {
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
          250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000,
          3250, 3500, 3750, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500,
          8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000,
        ],
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

    server.route(/^\/metrics$/, async (data, match, end, ask) => {
      ask.res.setHeader('Content-Type', register.contentType)
      ask.res.end(await register.metrics())
    })
  }

  stop() {
    this.register.clear()
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = undefined
    }
  }

  async metrics() {
    return await this.register.getMetricsAsJSON()
  }

  /**
   * @param {object} attrs Refer to individual attrs
   * @param {string} attrs.category e.g: 'build'
   * @param {string} attrs.serviceFamily e.g: 'npm'
   * @param {string} attrs.name e.g: 'NpmVersion'
   * @returns {object} `{ inc() {} }`.
   */
  createNumRequestCounter({ category, serviceFamily, name }) {
    const service = decamelize(name)
    return this.counters.numRequests.labels(category, serviceFamily, service)
  }

  noteResponseTime(responseTime) {
    return this.counters.responseTime.observe(responseTime)
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
