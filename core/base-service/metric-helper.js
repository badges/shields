'use strict'

class MetricHelper {
  constructor({ metricInstance }, { category, serviceFamily, name }) {
    if (metricInstance) {
      this.serviceRequestCounter = metricInstance.createServiceRequestCounter({
        category,
        serviceFamily,
        name,
      })
    } else {
      this.serviceRequestCounter = undefined
    }
  }

  static create({ metricInstance, ServiceClass }) {
    const { category, serviceFamily, name } = ServiceClass
    return new this({ metricInstance }, { category, serviceFamily, name })
  }

  noteResponseSent() {
    const { serviceRequestCounter } = this
    if (serviceRequestCounter) {
      serviceRequestCounter.inc()
    }
  }
}

module.exports = { MetricHelper }
