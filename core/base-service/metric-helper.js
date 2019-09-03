'use strict'

class MetricHelper {
  constructor({ metricInstance }, { category, serviceFamily, name }) {
    if (metricInstance) {
      this._serviceRequestCounter = metricInstance.createServiceRequestCounter({
        category,
        serviceFamily,
        name,
      })
    } else {
      // When metrics are disabled, use a mock counter.
      this._serviceRequestCounter = { inc: () => {} }
    }
  }

  static create({ metricInstance, ServiceClass }) {
    const { category, serviceFamily, name } = ServiceClass
    return new this({ metricInstance }, { category, serviceFamily, name })
  }

  noteResponseSent() {
    this._serviceRequestCounter.inc()
  }
}

module.exports = { MetricHelper }
