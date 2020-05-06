'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('license (valid)').get('/Config-Augeas.json').expectBadge({
  label: 'license',
  message: 'lgpl_2_1',
})

t.create('license (not found)').get('/not-a-package.json').expectBadge({
  label: 'cpan',
  message: 'not found',
})
