'use strict'
const groupBy = require('lodash.groupby')

function promClientJsonToInfluxV2(metrics, extraLabels = {}) {
  return metrics
    .flatMap(metric => {
      const valuesByLabels = groupBy(metric.values, value =>
        JSON.stringify(Object.entries(value.labels).sort())
      )
      return Object.values(valuesByLabels).map(metricsWithSameLabel => {
        const labels = Object.entries(metricsWithSameLabel[0].labels)
          .concat(Object.entries(extraLabels))
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(labelEntry => `${labelEntry[0]}=${labelEntry[1]}`)
          .join(',')
        const labelsFormatted = labels ? `,${labels}` : ''
        const values = metricsWithSameLabel
          .sort((a, b) => a.metricName.localeCompare(b.metricName))
          .map(value => `${value.metricName || metric.name}=${value.value}`)
          .join(',')
        return `prometheus${labelsFormatted} ${values}`
      })
    })
    .join('\n')
}

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

module.exports = { promClientJsonToInflux, promClientJsonToInfluxV2 }
