'use strict'

const { performance } = require('perf_hooks')

class MetricHelper {
  constructor({ metricInstance }, { category, serviceFamily, name }) {
    if (metricInstance) {
      this.metricInstance = metricInstance
      this.serviceRequestCounter = metricInstance.createNumRequestCounter({
        category,
        serviceFamily,
        name,
      })
    } else {
      this.metricInstance = undefined
      this.serviceRequestCounter = undefined
    }
  }

  static create({ metricInstance, ServiceClass }) {
    const { category, serviceFamily, name } = ServiceClass
    return new this({ metricInstance }, { category, serviceFamily, name })
  }

  startRequest() {
    const { metricInstance, serviceRequestCounter } = this

    const requestStartTime = performance.now()

    return {
      noteResponseSent() {
        if (metricInstance) {
          const elapsedTime = performance.now() - requestStartTime
          metricInstance.noteResponseTime(elapsedTime)
        }

        if (serviceRequestCounter) {
          serviceRequestCounter.inc()
        }
      },
    }
  }
}

module.exports = { MetricHelper }
