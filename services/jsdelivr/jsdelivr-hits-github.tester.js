'use strict'

const { isMetricOverTimePeriod } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('jquery/jquery hits/day')
  .timeout(10000)
  .get('/hd/jquery/jquery.json')
  .expectBadge({
    label: 'jsdelivr',
    message: isMetricOverTimePeriod,
  })

t.create('jquery/jquery hits/week')
  .timeout(10000)
  .get('/hw/jquery/jquery.json')
  .expectBadge({
    label: 'jsdelivr',
    message: isMetricOverTimePeriod,
  })

t.create('jquery/jquery hits/month')
  .timeout(10000)
  .get('/hm/jquery/jquery.json')
  .expectBadge({
    label: 'jsdelivr',
    message: isMetricOverTimePeriod,
  })

t.create('jquery/jquery hits/year')
  .timeout(10000)
  .get('/hy/jquery/jquery.json')
  .expectBadge({
    label: 'jsdelivr',
    message: isMetricOverTimePeriod,
  })

t.create('fake package')
  .timeout(10000)
  .get('/hd/somefakepackage/somefakepackage.json')
  .expectBadge({
    label: 'jsdelivr',
    // Will return 0 hits/day as the endpoint can't send 404s at present.
    message: '0/day',
  })
