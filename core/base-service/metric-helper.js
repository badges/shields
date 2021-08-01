import { performance } from 'perf_hooks'

class MetricHelper {
  constructor({ metricInstance }, { category, serviceFamily, name }) {
    if (metricInstance) {
      this.metricInstance = metricInstance
      this.serviceRequestCounter = metricInstance.createNumRequestCounter({
        category,
        serviceFamily,
        name,
      })
      this.serviceResponseSizeHistogram =
        metricInstance.createServiceResponseSizeHistogram({
          category,
          serviceFamily,
          name,
        })
    } else {
      this.metricInstance = undefined
      this.serviceRequestCounter = undefined
      this.serviceResponseSizeHistogram = undefined
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

  noteServiceResponseSize(size) {
    if (this.serviceResponseSizeHistogram) {
      return this.serviceResponseSizeHistogram.observe(size)
    }
  }
}

const MetricNames = Object.freeze({
  SERVICE_RESPONSE_SIZE: Symbol('service-response-size'),
})

export { MetricHelper, MetricNames }
