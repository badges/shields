'use strict'

const { isMetric, isMetricOverTimePeriod } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('daily downloads (valid, no package version specified)')
  .get('/dd/doctrine/orm.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('monthly downloads (valid, no package version specified)')
  .get('/dm/doctrine/orm.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('total downloads (valid, no package version specified)')
  .get('/dt/doctrine/orm.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

// note: packagist can't give us download stats for a specific version
t.create('daily downloads (invalid, package version specified)')
  .get('/dd/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: '404', message: 'badge not found' })

t.create('monthly downloads (invalid, package version in request)')
  .get('/dm/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: '404', message: 'badge not found' })

t.create('total downloads (invalid, package version in request)')
  .get('/dt/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: '404', message: 'badge not found' })

t.create('daily downloads (invalid package name)')
  .get('/dd/frodo/is-not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('monthly downloads (invalid package name)')
  .get('/dm/frodo/is-not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('total downloads (invalid package name)')
  .get('/dt/frodo/is-not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
