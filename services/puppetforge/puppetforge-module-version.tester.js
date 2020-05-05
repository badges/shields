'use strict'

const { isSemver } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('module version').get('/camptocamp/openssl.json').expectBadge({
  label: 'puppetforge',
  message: isSemver,
})

t.create('module version (not found)')
  .get('/notarealuser/notarealpackage.json')
  .expectBadge({
    label: 'puppetforge',
    message: 'not found',
  })
