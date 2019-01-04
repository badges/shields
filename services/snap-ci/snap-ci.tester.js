'use strict'

const ServiceTester = require('../service-tester')

const t = new ServiceTester({ id: 'snap-ci', title: 'Snap CI' })
module.exports = t

t.create('no longer available (previously build state)')
  .get('/snap-ci/ThoughtWorksStudios/eb_deployer/master.json')
  .expectJSON({
    name: 'snap ci',
    value: 'no longer available',
  })
