'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('version (valid)')
  .get('/Config-Augeas.json')
  .expectBadge({
    label: 'cpan',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectBadge({
    label: 'cpan',
    message: 'not found',
  })
