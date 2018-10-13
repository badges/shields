'use strict'

const ServiceTester = require('../service-tester')

const t = new ServiceTester({ id: 'cpan', title: 'Cpan' })
module.exports = t

t.create('license')
  .get('/l/Config-Augeas.json')
  .expectJSON({
    name: 'license',
    value: 'lgpl_2_1',
  })
