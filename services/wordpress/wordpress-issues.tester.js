'use strict'

const { ServiceTester } = require('../tester')
const {
  isMetric,
  isIntegerPercentage,
  isMetricOverMetric,
} = require('../test-validators')

const t = new ServiceTester({
  id: 'wordpress',
  title: 'WordPress Plugin Issues',
})
module.exports = t

t.create('Plugin Issues - Open Raw')
  .get('/plugin/issues/raw/open/jetpack.json')
  .expectBadge({
    label: 'open issues',
    message: isMetric,
  })

t.create('Plugin Issues - Closed Raw')
  .get('/plugin/issues/raw/closed/jetpack.json')
  .expectBadge({
    label: 'closed issues',
    message: isMetric,
  })

t.create('Plugin Issues - Open Percentage')
  .get('/plugin/issues/percentage/open/jetpack.json')
  .expectBadge({
    label: 'open issues',
    message: isIntegerPercentage,
  })

t.create('Plugin Issues - Closed Percentage')
  .get('/plugin/issues/percentage/closed/jetpack.json')
  .expectBadge({
    label: 'closed issues',
    message: isIntegerPercentage,
  })

t.create('Plugin Issues - Open Out Of')
  .get('/plugin/issues/outof/open/jetpack.json')
  .expectBadge({
    label: 'open issues',
    message: isMetricOverMetric,
  })

t.create('Plugin Issues - Closed Out Of')
  .get('/plugin/issues/outof/closed/jetpack.json')
  .expectBadge({
    label: 'closed issues',
    message: isMetricOverMetric,
  })

t.create('Plugin Issues - Open/Closed')
  .get('/plugin/issues/opcl/jetpack.json')
  .expectBadge({
    label: 'open/closed',
    message: isMetricOverMetric,
  })
