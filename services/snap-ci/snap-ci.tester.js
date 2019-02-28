'use strict'

const { ServiceTester } = require('../tester')

const t = new ServiceTester({ id: 'snap-ci', title: 'Snap CI' })
module.exports = t

t.create('no longer available (previously build state)')
  .get('/snap-ci/ThoughtWorksStudios/eb_deployer/master.json')
  .expectBadge({
    label: 'snap ci',
    message: 'no longer available',
  })
