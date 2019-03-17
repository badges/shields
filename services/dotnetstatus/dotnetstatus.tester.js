'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'dotnetstatus',
  title: 'dotnet-status',
}))

t.create('no longer available (previously get package status)')
  .get('/gh/jaredcnance/dotnet-status/API.json')
  .expectBadge({
    label: 'dotnet status',
    message: 'no longer available',
  })
