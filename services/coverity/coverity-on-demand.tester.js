'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'CoverityOnDemand',
  title: 'Coverity On Demand',
  pathPrefix: '/coverity/ondemand',
}))

t.create('no longer available (streams)')
  .get('/streams/44b25sjc9l3ntc2ngfi29tngro.json')
  .expectBadge({
    label: 'coverity',
    message: 'no longer available',
  })

t.create('no longer available (jobs)')
  .get('/jobs/p4tmm8031t4i971r0im4s7lckk.json')
  .expectBadge({
    label: 'coverity',
    message: 'no longer available',
  })
