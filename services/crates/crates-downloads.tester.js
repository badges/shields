'use strict'

const ServiceTester = require('../service-tester')
const { isMetric } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'crates',
  title: 'crates.io',
  pathPrefix: '/crates',
}))

t.create('total downloads')
  .get('/d/libc.json')
  .expectJSONTypes({ name: 'downloads', value: isMetric })

t.create('total downloads (with version)')
  .get('/d/libc/0.2.31.json')
  .expectJSONTypes({
    name: 'downloads@0.2.31',
    value: isMetric,
  })

t.create('downloads for version')
  .get('/dv/libc.json')
  .expectJSONTypes({
    name: 'downloads@latest',
    value: isMetric,
  })

t.create('downloads for version (with version)')
  .get('/dv/libc/0.2.31.json')
  .expectJSONTypes({
    name: 'downloads@0.2.31',
    value: isMetric,
  })

t.create('downloads (invalid version)')
  .get('/d/libc/7.json')
  .expectJSON({ name: 'crates.io', value: 'invalid semver: 7' })

t.create('downloads (not found)')
  .get('/d/not-a-real-package.json')
  .expectJSON({ name: 'crates.io', value: 'not found' })
