'use strict'

const { ServiceTester } = require('../tester')

const t = new ServiceTester({ id: 'magnumci', title: 'Magnum CI' })
module.exports = t

t.create('no longer available')
  .get('/ci/96ffb83fa700f069024921b0702e76ff.json')
  .expectBadge({
    label: 'magnum ci',
    message: 'no longer available',
  })
