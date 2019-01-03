'use strict'

const t = (module.exports = require('../create-service-tester')())

t.create('license (valid)')
  .get('/Config-Augeas.json')
  .expectJSON({
    name: 'license',
    value: 'lgpl_2_1',
  })

t.create('license (not found)')
  .get('/not-a-package.json')
  .expectJSON({
    name: 'cpan',
    value: 'not found',
  })
