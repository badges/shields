'use strict'

const { isMetricOverTimePeriod } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('(live) jquery hits/day')
  .get('/hd/jquery.json')
  .expectBadge({
    label: 'jsdelivr',
    message: isMetricOverTimePeriod,
  })

t.create('(live) jquery hits/week')
  .get('/hw/jquery.json')
  .expectBadge({
    label: 'jsdelivr',
    message: isMetricOverTimePeriod,
  })

t.create('(live) jquery hits/month')
  .get('/hm/jquery.json')
  .expectBadge({
    label: 'jsdelivr',
    message: isMetricOverTimePeriod,
  })

t.create('(live) jquery hits/year')
  .get('/hy/jquery.json')
  .expectBadge({
    label: 'jsdelivr',
    message: isMetricOverTimePeriod,
  })

t.create('(live) fake package')
  .get('/hd/somefakepackage.json')
  .expectBadge({
    label: 'jsdelivr',
    // Will return 0 hits/day as the endpoint can't send 404s at present.
    message: '0/day',
  })
