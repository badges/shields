'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('version (valid)')
  .get('/Config-Augeas.json')
  .expectJSONTypes({
    name: 'cpan',
    value: isVPlusDottedVersionAtLeastOne,
  })

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectJSON({
    name: 'cpan',
    value: 'not found',
  })
