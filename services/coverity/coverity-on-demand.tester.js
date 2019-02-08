'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'CoverityOnDemand',
  title: 'Coverity On Demand',
  pathPrefix: '/coverity/ondemand',
}))

t.create('no longer available (streams)')
  .get('/streams/44b25sjc9l3ntc2ngfi29tngro.json')
  .expectJSON({
    name: 'coverity',
    value: 'no longer available',
  })

t.create('no longer available (jobs)')
  .get('/jobs/p4tmm8031t4i971r0im4s7lckk.json')
  .expectJSON({
    name: 'coverity',
    value: 'no longer available',
  })
