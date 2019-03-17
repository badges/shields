'use strict'

const { ServiceTester } = require('../tester')
const { isMetric } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'crates',
  title: 'crates.io',
  pathPrefix: '/crates',
}))

t.create('total downloads')
  .get('/d/libc.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('total downloads (with version)')
  .get('/d/libc/0.2.31.json')
  .expectBadge({
    label: 'downloads@0.2.31',
    message: isMetric,
  })

t.create('downloads for version')
  .get('/dv/libc.json')
  .expectBadge({
    label: 'downloads@latest',
    message: isMetric,
  })

t.create('downloads for version (with version)')
  .get('/dv/libc/0.2.31.json')
  .expectBadge({
    label: 'downloads@0.2.31',
    message: isMetric,
  })

t.create('downloads (invalid version)')
  .get('/d/libc/7.json')
  .expectBadge({ label: 'crates.io', message: 'invalid semver: 7' })

t.create('downloads (not found)')
  .get('/d/not-a-real-package.json')
  .expectBadge({ label: 'crates.io', message: 'not found' })
