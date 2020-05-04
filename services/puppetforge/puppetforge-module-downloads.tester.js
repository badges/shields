'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('module downloads').get('/camptocamp/openssl.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('module downloads (not found)')
  .get('/notarealuser/notarealpackage.json')
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })
