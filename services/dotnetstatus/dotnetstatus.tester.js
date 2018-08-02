'use strict'

const ServiceTester = require('../service-tester')

const t = new ServiceTester({ id: 'dotnetstatus', title: 'dotnet-status' })
module.exports = t

t.create('no longer available (previously get package status)')
  .get('/gh/jaredcnance/dotnet-status/API.json')
  .expectJSON({
    name: 'dotnet status',
    value: 'no longer available',
  })
