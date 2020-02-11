'use strict'

function promClientJsonToInflux(metrics) {
  return metrics.flatMap(metric =>
    metric.values.map(value => {
      const optionalTags =
        Object.entries(value.labels).length === 0
          ? ''
          : `,${Object.entries(value.labels)
              .map(labelEntry => `${labelEntry[0]}=${labelEntry[1]}`)
              .toString()}`
      const optionalTimestamp = value.timestamp ? ` ${value.timestamp}` : ''
      return `${value.metricName || metric.name}${optionalTags} value=${
        value.value
      }${optionalTimestamp}`
    })
  )
}

module.exports = { promClientJsonToInflux }
