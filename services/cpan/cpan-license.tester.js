'use strict'

const createServiceTester = require('../create-service-tester')
const t = createServiceTester()
module.exports = t

t.create('license')
  .get('/Config-Augeas.json')
  .expectJSON({
    name: 'license',
    value: 'lgpl_2_1',
  })
