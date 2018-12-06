'use strict'

const t = (module.exports = require('../create-service-tester')())

t.create('license')
  .get('/Config-Augeas.json')
  .expectJSON({
    name: 'license',
    value: 'lgpl_2_1',
  })
